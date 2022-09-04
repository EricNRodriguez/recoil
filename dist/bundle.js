'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var typescriptMonads = require('typescript-monads');

class StatefulSideEffectError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = "StatefulSideEffectError";
    this.stack = new Error().stack;
  }
}

class WeakCollection {
  items = [];
  itemsSet = /* @__PURE__ */ new WeakSet([]);
  getItems() {
    const items = [
      ...this.items.map((ref) => ref.deref()).filter((item) => item !== void 0).map((item) => item)
    ];
    this.removeGCdItems();
    return items;
  }
  register(item) {
    if (this.itemsSet.has(item)) {
      return;
    }
    const ref = new WeakRef(item);
    this.itemsSet.add(item);
    this.items.push(ref);
  }
  deregister(item) {
    this.itemsSet.delete(item);
    this.items = this.items.filter((v) => v.deref() !== item);
  }
  reset() {
    this.items.forEach((ref) => {
      const item = ref.deref();
      if (item !== void 0) {
        this.itemsSet.delete(item);
      }
    });
    this.items = [];
  }
  forEach(consumer) {
    this.items.forEach((ref) => {
      const item = ref.deref();
      if (item !== void 0) {
        consumer(item);
      }
    });
    this.removeGCdItems();
  }
  removeGCdItems() {
    this.items = this.items.filter(
      (ref) => ref.deref() !== void 0
    );
  }
}

const isAtom = (obj) => {
  return obj instanceof Object && "get" in obj && "getUntracked" in obj && "invalidate" in obj && "map" in obj;
};
class BaseAtom {
  context;
  parents = new WeakCollection();
  constructor(context) {
    this.context = context;
  }
  getParents() {
    return this.parents.getItems();
  }
  forgetParents() {
    this.parents.reset();
  }
  invalidate() {
    this.parents.forEach((parent) => {
      parent.childDirty();
      parent.childReady();
    });
  }
  getContext() {
    return this.context;
  }
  latchToCurrentDerivation() {
    this.getContext().getCurrentParent().tapSome(this.parents.register.bind(this.parents));
  }
  map(mutation) {
    return new VirtualDerivedAtom(
      this.context,
      () => mutation(this.get())
    );
  }
}
class LeafAtomImpl extends BaseAtom {
  value;
  constructor(value, context) {
    super(context);
    this.value = value;
  }
  get() {
    this.latchToCurrentDerivation();
    return this.getUntracked();
  }
  getUntracked() {
    return this.value;
  }
  set(value) {
    this.checkSetIsNotASideEffect();
    if (value === this.value) {
      return;
    }
    this.value = value;
    this.dirty();
  }
  update(fn) {
    this.set(fn(this.getUntracked()));
  }
  dirty() {
    const prevParents = this.getParents();
    this.forgetParents();
    prevParents.forEach((parent) => {
      parent.childDirty();
      parent.childReady();
    });
  }
  checkSetIsNotASideEffect() {
    if (this.getContext().getCurrentParent().isSome()) {
      throw new StatefulSideEffectError(
        "stateful set called on leaf atom during derivation"
      );
    }
  }
}
class VirtualDerivedAtom {
  context;
  derivation;
  tracker;
  constructor(context, derivation) {
    this.context = context;
    this.derivation = derivation;
    this.tracker = new LeafAtomImpl(false, context);
  }
  get() {
    this.tracker.get();
    return this.derivation();
  }
  getUntracked() {
    this.context.enterNewTrackingContext();
    try {
      return this.get();
    } finally {
      this.context.exitCurrentTrackingContext();
    }
  }
  invalidate() {
    this.tracker.invalidate();
  }
  map(transform) {
    return new VirtualDerivedAtom(
      this.context,
      () => transform(this.get())
    );
  }
}
class DerivedAtom extends BaseAtom {
  deriveValue;
  value = typescriptMonads.Maybe.none();
  numChildrenNotReady = 0;
  constructor(deriveValue, context) {
    super(context);
    this.deriveValue = deriveValue;
  }
  get() {
    this.latchToCurrentDerivation();
    return this.executeScopedDerivation();
  }
  executeScopedDerivation() {
    try {
      this.getContext().pushParent(this);
      return this.deriveValue();
    } finally {
      this.getContext().popParent();
    }
  }
  getUntracked() {
    this.getContext().enterNewTrackingContext();
    try {
      return this.deriveValue();
    } finally {
      this.getContext().exitCurrentTrackingContext();
    }
  }
  childReady() {
    this.numChildrenNotReady--;
    if (this.numChildrenNotReady === 0) {
      const prevParents = this.getParents();
      this.forgetParents();
      prevParents.forEach((parent) => {
        parent.childReady();
      });
    }
  }
  childDirty() {
    this.discardCachedValue();
    if (this.numChildrenNotReady === 0) {
      this.getParents().forEach((parent) => {
        parent.childDirty();
      });
    }
    this.numChildrenNotReady++;
  }
  discardCachedValue() {
    this.value = typescriptMonads.Maybe.none();
  }
}
class SideEffect {
  effect;
  effectScheduler;
  context;
  numChildrenNotReady = 0;
  state = { status: "active" /* ACTIVE */ };
  constructor(effect, context, effectScheduler) {
    this.effect = effect;
    this.context = context;
    this.effectScheduler = effectScheduler;
  }
  run() {
    this.effectScheduler.schedule(this.runScoped);
  }
  runScoped = () => {
    try {
      this.context.pushParent(this);
      this.effect();
    } finally {
      this.context.popParent();
    }
  };
  childReady() {
    this.numChildrenNotReady--;
    if (this.numChildrenNotReady === 0) {
      switch (this.state.status) {
        case "active" /* ACTIVE */:
          this.run();
          return;
        case "inactive" /* INACTIVE */:
          this.state.dirty = true;
          return;
        default:
          throw new Error("invalid state");
      }
    }
  }
  childDirty() {
    this.numChildrenNotReady++;
  }
  activate() {
    if (this.state.status === "active" /* ACTIVE */) {
      return;
    }
    if (this.state.dirty) {
      this.run();
    }
    this.state = { status: "active" /* ACTIVE */ };
  }
  deactivate() {
    this.state = { status: "inactive" /* INACTIVE */, dirty: false };
  }
}

class AtomTrackingContext {
  scopeStack = [[]];
  getCurrentScope() {
    return this.scopeStack[this.scopeStack.length - 1];
  }
  getCurrentParent() {
    const currentScope = this.getCurrentScope();
    if (currentScope.length === 0) {
      return typescriptMonads.Maybe.none();
    }
    return typescriptMonads.Maybe.some(currentScope[currentScope.length - 1]);
  }
  pushParent(derivation) {
    this.getCurrentScope().push(derivation);
  }
  popParent() {
    this.getCurrentScope().pop();
  }
  enterNewTrackingContext() {
    this.scopeStack.push([]);
  }
  exitCurrentTrackingContext() {
    if (this.scopeStack.length === 1) {
      throw new Error("unable to exit the base context");
    }
    this.scopeStack.pop();
  }
}

class BatchingEffectScheduler {
  state = { kind: "eager" /* EAGER */ };
  schedule(update) {
    switch (this.state.kind) {
      case "batch" /* BATCH */:
        this.scheduleBatchedUpdate(update);
        return;
      case "eager" /* EAGER */:
        this.scheduleEagerUpdate(update);
        return;
      default:
        throw new Error(
          `fallthrough - BatchingEffectScheduler in invalid state state`
        );
    }
  }
  enterBatchState() {
    if (this.state.kind === "batch" /* BATCH */) {
      return;
    }
    this.state = {
      kind: "batch" /* BATCH */,
      scheduledUpdates: /* @__PURE__ */ new Set()
    };
  }
  exitBatchedState() {
    if (this.state.kind !== "batch" /* BATCH */) {
      return;
    }
    this.state.scheduledUpdates.forEach((update) => update());
    this.state = { kind: "eager" /* EAGER */ };
  }
  scheduleBatchedUpdate(update) {
    this.state.scheduledUpdates.add(update);
  }
  scheduleEagerUpdate(update) {
    update();
  }
}

const globalTrackingContext = new AtomTrackingContext();
const globalEffectScheduler = new BatchingEffectScheduler();
class ApiFunctionBuilder {
  static instance = new ApiFunctionBuilder();
  decoratorRegistry = /* @__PURE__ */ new Map();
  baseFuncRegistry = /* @__PURE__ */ new Map();
  static getInstance() {
    return ApiFunctionBuilder.instance;
  }
  build(baseFunc) {
    const externalFunc = (...args) => {
      return this.composeFunction(externalFunc)(...args);
    };
    this.decoratorRegistry.set(externalFunc, []);
    this.baseFuncRegistry.set(externalFunc, baseFunc);
    return externalFunc;
  }
  registerDecorator(apiFn, decorator) {
    if (!this.decoratorRegistry.has(apiFn)) {
      throw new Error("decorating the provided function is not supported");
    }
    this.decoratorRegistry.get(apiFn).push(decorator);
  }
  deregisterDecorator(apiFn, decorator) {
    this.decoratorRegistry.set(
      apiFn,
      (this.decoratorRegistry.get(apiFn) ?? []).filter(
        (dec) => dec !== decorator
      )
    );
  }
  composeFunction(externalFunc) {
    if (!this.baseFuncRegistry.has(externalFunc)) {
      throw new Error("unable to compose unknown function");
    }
    const baseFunc = this.baseFuncRegistry.get(externalFunc);
    const decorations = this.decoratorRegistry.get(
      externalFunc
    );
    return decorations.reduceRight(
      (composedFunc, decorator) => decorator(composedFunc),
      baseFunc
    );
  }
}
const registerDecorator = (apiFn, decorator) => {
  return ApiFunctionBuilder.getInstance().registerDecorator(apiFn, decorator);
};
const deregisterDecorator = (apiFn, decorator) => {
  return ApiFunctionBuilder.getInstance().deregisterDecorator(apiFn, decorator);
};
const fetchState = ApiFunctionBuilder.getInstance().build(
  (producer) => {
    let reactionVersion = 0;
    let writeVersion = 0;
    const atom = new LeafAtomImpl(
      void 0,
      globalTrackingContext
    );
    const derivation = new DerivedAtom(
      producer,
      globalTrackingContext
    );
    const sideEffectRunnable = () => {
      let currentReactionVersion = reactionVersion++;
      derivation.get().then((val) => {
        if (val === void 0) {
          return;
        }
        if (writeVersion > currentReactionVersion) {
          return;
        }
        atom.set(val);
        writeVersion = currentReactionVersion;
      });
    };
    const ref = new SideEffect(
      sideEffectRunnable,
      globalTrackingContext,
      globalEffectScheduler
    );
    ref.run();
    atom.$$$recoilFetchStateDerivation = [derivation, ref];
    return atom;
  }
);
const createState = ApiFunctionBuilder.getInstance().build(
  (value) => {
    return new LeafAtomImpl(value, globalTrackingContext);
  }
);
const deriveState = ApiFunctionBuilder.getInstance().build(
  (deriveValue, cache = true) => {
    if (cache) {
      return new DerivedAtom(deriveValue, globalTrackingContext);
    } else {
      return new VirtualDerivedAtom(globalTrackingContext, deriveValue);
    }
  }
);
const runEffect = ApiFunctionBuilder.getInstance().build((effect) => {
  const sideEffect = new SideEffect(
    effect,
    globalTrackingContext,
    globalEffectScheduler
  );
  sideEffect.run();
  return sideEffect;
});
const state = ApiFunctionBuilder.getInstance().build(() => {
  const registry = /* @__PURE__ */ new WeakMap();
  return function(target, propertyKey) {
    Object.defineProperty(target, propertyKey, {
      set: function(newVal) {
        if (!registry.has(this)) {
          registry.set(this, new LeafAtomImpl(newVal, globalTrackingContext));
        } else {
          registry.get(this).set(newVal);
        }
      },
      get: function() {
        return registry.get(this).get();
      }
    });
  };
});
const derivedState = ApiFunctionBuilder.getInstance().build(
  () => {
    return (target, propertyKey, descriptor) => {
      const registry = /* @__PURE__ */ new WeakMap();
      const originalFn = descriptor.value;
      descriptor.value = function(...args) {
        if (!registry.has(this)) {
          registry.set(
            this,
            new DerivedAtom(() => {
              return originalFn.apply(this, args);
            }, globalTrackingContext)
          );
        }
        return registry.get(this).get();
      };
    };
  }
);
const runUntracked = (job) => {
  try {
    globalTrackingContext.enterNewTrackingContext();
    return job();
  } finally {
    globalTrackingContext.exitCurrentTrackingContext();
  }
};
const runBatched = (job) => {
  try {
    globalEffectScheduler.enterBatchState();
    job();
  } finally {
    globalEffectScheduler.exitBatchedState();
  }
};

const nullOrUndefined = (item) => {
  return item === null || item === void 0;
};
const notNullOrUndefined = (item) => {
  return !nullOrUndefined(item);
};
const nonEmpty = (col) => {
  return col.length !== 0;
};

const frag$1 = document.createDocumentFragment();
const reconcileNodeArrays = ({
  parent,
  currentNodes,
  newNodes
}) => {
  let curLeft = 0;
  let curRight = currentNodes.length;
  let newLeft = 0;
  let newRight = newNodes.length;
  let newNodesIndex = new Map(
    newNodes.map((node, idx) => [node, idx])
  );
  const appendRestOfNewNodes = () => {
    let nextNodeAnchor = null;
    if (newRight < newNodes.length) {
      if (newLeft > 0) {
        nextNodeAnchor = newNodes[newLeft - 1].nextSibling;
      } else {
        nextNodeAnchor = newNodes[newRight];
      }
    } else {
      nextNodeAnchor = currentNodes[currentNodes.length - 1]?.nextSibling;
    }
    for (let i = newLeft; i < newRight; ++i) {
      frag$1.append(newNodes[i]);
    }
    newLeft = newRight;
    parent.insertBefore(frag$1, nextNodeAnchor);
  };
  const removeRestOfCurrentNodes = () => {
    currentNodes.slice(curLeft, curRight).forEach((node) => {
      node.remove();
      ++curLeft;
    });
  };
  const fallbackAndMapContiguousChunk = () => {
    if (newNodesIndex.has(currentNodes[curLeft])) {
      const curStartIndexInNew = newNodesIndex.get(currentNodes[curLeft]);
      if (curStartIndexInNew < newLeft || curStartIndexInNew >= newRight) {
        return;
      }
      let contigSubsequenceLen = 1;
      for (let i = curLeft + 1; i < curRight && i < newRight; ++i) {
        const curIIndexInNew = newNodesIndex.get(
          currentNodes[i]
        );
        if (nullOrUndefined(curIIndexInNew) || curIIndexInNew - contigSubsequenceLen !== curStartIndexInNew) {
          break;
        }
        contigSubsequenceLen++;
      }
      if (contigSubsequenceLen > curStartIndexInNew - newLeft) {
        const node = currentNodes[curLeft];
        while (newLeft < curStartIndexInNew) {
          parent.insertBefore(newNodes[newLeft], node);
          ++newLeft;
        }
      } else {
        parent.replaceChild(newNodes[newLeft], currentNodes[curLeft]);
        ++curLeft;
        ++newLeft;
      }
    } else {
      currentNodes[curLeft].remove();
      ++curLeft;
    }
  };
  const clipPrefix = () => {
    while (curLeft < curRight && newLeft < newRight && currentNodes[curLeft] === newNodes[newLeft]) {
      ++curLeft;
      ++newLeft;
    }
  };
  const clipSuffix = () => {
    while (curRight > curLeft && newRight > newLeft && currentNodes[curRight - 1] === newNodes[newRight - 1]) {
      --curRight;
      --newRight;
    }
  };
  while (curLeft < curRight || newLeft < newRight) {
    clipPrefix();
    clipSuffix();
    if (curLeft === curRight) {
      appendRestOfNewNodes();
    } else if (newLeft === newRight) {
      removeRestOfCurrentNodes();
    } else {
      fallbackAndMapContiguousChunk();
    }
  }
};

class BaseWNode {
  parent = null;
  node;
  isDocumentFragment;
  children = [];
  onMountHooks = /* @__PURE__ */ new Set();
  onUnmountHooks = /* @__PURE__ */ new Set();
  currentlyMounted = false;
  constructor(node) {
    this.node = node;
    this.isDocumentFragment = this.node instanceof DocumentFragment;
  }
  isFragment() {
    return this.isDocumentFragment;
  }
  setProperty(prop, value) {
    this.unwrap()[prop] = value;
    return this;
  }
  getUnpackedChildren() {
    const unpackedNodes = [];
    for (let wNode of this.getChildren()) {
      if (wNode.isFragment()) {
        for (let child of wNode.getUnpackedChildren()) {
          unpackedNodes.push(child);
        }
      } else {
        unpackedNodes.push(wNode.unwrap());
      }
    }
    return unpackedNodes;
  }
  getChildren() {
    return this.children;
  }
  rebindChildren() {
    this.setChildren(this.children);
  }
  setChildren(children) {
    const newChildren = children.map(wrapInVNode).filter(notNullOrUndefined);
    const newChildrenSet = new Set(newChildren);
    if (this.isMounted()) {
      this.children.filter((cc) => !newChildrenSet.has(cc)).forEach((cc) => {
        cc.unmount();
        cc.setParent(null);
      });
    }
    this.children.length = 0;
    this.children.push(...newChildren);
    newChildren.forEach((nc) => {
      nc.setParent(this);
      this.syncMountStatusOfChild(nc);
    });
    if (this.isFragment()) {
      this.getParent()?.rebindChildren();
      return this;
    }
    reconcileNodeArrays({
      parent: this.unwrap(),
      currentNodes: Array.from(this.unwrap().childNodes),
      newNodes: this.getUnpackedChildren()
    });
    return this;
  }
  syncMountStatusOfChild(child) {
    child.setParent(this);
    if (this.isMounted() !== child.isMounted()) {
      this.isMounted() ? child.mount() : child.unmount();
    }
  }
  isMounted() {
    return this.currentlyMounted;
  }
  setParent(parent) {
    this.parent = parent;
  }
  getParent() {
    return this.parent;
  }
  mount() {
    this.currentlyMounted = true;
    this.children.forEach((child) => {
      child.mount();
    });
    this.runMountHooks();
    return this;
  }
  unmount() {
    this.currentlyMounted = false;
    this.children.forEach((child) => {
      child.unmount();
    });
    this.runUnmountHooks();
    return this;
  }
  runUnmountHooks() {
    this.onUnmountHooks.forEach((hook) => hook());
  }
  runMountHooks() {
    this.onMountHooks.forEach((hook) => hook());
  }
  registerOnMountHook(hook) {
    this.onMountHooks.add(hook);
    return this;
  }
  registerOnUnmountHook(hook) {
    this.onUnmountHooks.add(hook);
    return this;
  }
  unwrap() {
    return this.node;
  }
}
class WNode extends BaseWNode {
  constructor(node) {
    super(node);
  }
}
const isWNode = (content) => {
  return content instanceof Object && "unwrap" in content;
};
const wrapInVNode = (node) => {
  if (nullOrUndefined(node)) {
    return node;
  }
  if (isWNode(node)) {
    return node;
  } else {
    return new WNode(node);
  }
};

class BaseWElement extends BaseWNode {
  eventCoordinator;
  constructor(element, eventCoordinator) {
    super(element);
    this.eventCoordinator = eventCoordinator;
  }
  setAttribute(attribute, value) {
    this.unwrap().setAttribute(attribute, value);
    return this;
  }
  setEventHandler(type, listener, delegate = false) {
    if (delegate) {
      this.eventCoordinator.attachEventHandler(type, this.unwrap(), listener);
    } else {
      this.unwrap().addEventListener(type, listener);
    }
    return this;
  }
}
class WElement extends BaseWElement {
  constructor(elem, eventCoordinator) {
    super(elem, eventCoordinator);
  }
}

class GlobalEventCoordinator {
  eventTargets = /* @__PURE__ */ new Map();
  targetHandlers = /* @__PURE__ */ new WeakMap();
  attachEventHandler(event, target, handler) {
    if (!this.eventTargets.has(event)) {
      this.eventTargets.set(event, /* @__PURE__ */ new WeakSet());
      document.addEventListener(event, this.executeHandlersBottomUp);
    }
    this.eventTargets.get(event).add(target);
    if (!this.targetHandlers.has(target)) {
      this.targetHandlers.set(target, []);
    }
    this.targetHandlers.get(target).push({
      event,
      handler
    });
    return;
  }
  detachEventHandlers(event, target) {
    this.eventTargets.get(event)?.delete(target);
    this.targetHandlers.set(
      target,
      this.targetHandlers.get(target)?.filter((r) => r.event === event) ?? []
    );
  }
  executeHandlersBottomUp = (event) => {
    if (!event.bubbles) {
      throw new Error("delegated events should only be those that bubble");
    }
    let curTarget = event.composedPath()[0];
    let target = curTarget;
    Object.defineProperty(event, "target", { get: () => target });
    Object.defineProperty(event, "currentTarget", { get: () => curTarget });
    while (notNullOrUndefined(curTarget) && !event.cancelBubble) {
      if (this.eventTargets.get(event.type)?.has(curTarget) ?? false) {
        this.targetHandlers.get(curTarget)?.forEach((h) => {
          h.event === event.type && h.handler(event);
        });
      }
      if (notNullOrUndefined(curTarget?.host) && curTarget.host instanceof Node) {
        curTarget = event.composed ? curTarget.host : null;
        target = curTarget;
      } else {
        curTarget = curTarget.parentNode;
      }
    }
    return;
  };
}

const globalEventCoordinator = new GlobalEventCoordinator();
const createElement = (tag, props, children) => {
  const node = new WElement(
    tag instanceof HTMLElement ? tag : document.createElement(tag),
    globalEventCoordinator
  );
  node.setChildren(children);
  Object.entries(props).forEach(([key, val]) => {
    node.setProperty(key, val);
    if (isAtom(val)) {
      const ref = runEffect(
        () => node.setProperty(key, val.get())
      );
      node.registerOnMountHook(() => ref.activate());
      node.registerOnUnmountHook(() => ref.deactivate());
    } else {
      node.setProperty(key, val);
    }
  });
  return node;
};
const createTextNode = (text) => {
  const node = new WNode(document.createTextNode(""));
  if (isAtom(text)) {
    const ref = runEffect(
      () => node.setProperty("textContent", text.get())
    );
    node.registerOnMountHook(ref.activate.bind(ref));
    node.registerOnUnmountHook(ref.deactivate.bind(ref));
  } else {
    node.setProperty("textContent", text);
  }
  return node;
};
const createFragment = (children) => {
  return new WNode(document.createDocumentFragment()).setChildren(children);
};

const lazy = (getModule) => {
  return async (...args) => {
    const module = await getModule();
    return module.default(...args);
  };
};

class SymbolTable {
  symbols = [/* @__PURE__ */ new Map()];
  fork() {
    const child = new SymbolTable();
    child.symbols.length = 0;
    child.symbols.push(...this.symbols, /* @__PURE__ */ new Map());
    return child;
  }
  set(key, value) {
    if (this.symbols[this.symbols.length - 1].has(key)) {
      runUntracked(
        () => this.symbols[this.symbols.length - 1].get(key)?.set(value)
      );
    } else {
      this.symbols[this.symbols.length - 1].set(key, createState(value));
    }
  }
  get(key) {
    for (let i = this.symbols.length - 1; i >= 0; --i) {
      if (this.symbols[i].has(key)) {
        return this.symbols[i].get(key)?.get();
      }
    }
    return void 0;
  }
}
class ExecutionScopeManager {
  currentScope = new SymbolTable();
  getCurrentScope() {
    return this.currentScope;
  }
  withChildScope(fn) {
    return (...args) => {
      const parentScope = this.currentScope;
      this.currentScope = this.currentScope.fork();
      try {
        return fn(...args);
      } finally {
        this.currentScope = parentScope;
      }
    };
  }
  withCurrentScope(fn) {
    const capturedScope = this.currentScope.fork();
    return (...args) => {
      const currentScope = this.currentScope;
      this.currentScope = capturedScope;
      try {
        return fn(...args);
      } finally {
        this.currentScope = currentScope;
      }
    };
  }
}

class DeferredContextCallbackRegistry {
  scope = [];
  defer(fn) {
    if (!nonEmpty(this.scope)) {
      throw new Error("unable to defer functions outside of a scope");
    }
    this.scope[this.scope.length - 1].push(fn);
  }
  execute(job) {
    try {
      this.scope.push([]);
      const result = job();
      this.scope[this.scope.length - 1].forEach(
        (fn) => fn(result)
      );
      return result;
    } finally {
      this.scope.pop();
    }
  }
}
const contextDeferredCallbackRegistry = new DeferredContextCallbackRegistry();
const defer = (deferredFunction) => {
  contextDeferredCallbackRegistry.defer(deferredFunction);
};
const onInitialMount = (fn) => {
  let called = false;
  defer(
    (node) => node.registerOnMountHook(() => {
      if (called) {
        return;
      }
      try {
        fn();
      } finally {
        called = true;
      }
    })
  );
};
const onMount = (fn) => {
  defer((node) => node.registerOnMountHook(fn));
};
const onUnmount = (fn) => {
  defer((node) => node.registerOnUnmountHook(fn));
};
const runMountedEffect = (sideEffect) => {
  const ref = runEffect(sideEffect);
  defer(
    (node) => node.registerOnMountHook(ref.activate.bind(ref))
  );
  defer(
    (node) => node.registerOnUnmountHook(ref.deactivate.bind(ref))
  );
};
const scopeManager = new ExecutionScopeManager();
const provide = (key, value) => {
  scopeManager.getCurrentScope().set(key, value);
};
const inject = (key) => {
  return scopeManager.getCurrentScope().get(key);
};
const withContext = (component) => {
  return scopeManager.withChildScope((...args) => {
    return contextDeferredCallbackRegistry.execute(() => {
      return component(...args);
    });
  });
};
const captureContextState = scopeManager.withCurrentScope.bind(scopeManager);

const getKey = (item) => item[0];
const getItem = (item) => item[1];
const forEach = (props) => {
  let { items, render } = props;
  const anchor = createFragment([]);
  let currentItemIndex = /* @__PURE__ */ new Map();
  const ref = runEffect(() => {
    const newItems = items();
    const newItemOrder = newItems.map(getKey);
    const newItemNodesIndex = new Map(
      newItems.map((item) => [
        getKey(item),
        currentItemIndex.get(getKey(item)) ?? render(getItem(item))
      ])
    );
    const newChildren = newItemOrder.map((key) => newItemNodesIndex.get(key)).filter(notNullOrUndefined);
    anchor.setChildren(newChildren);
    currentItemIndex = newItemNodesIndex;
  });
  anchor.registerOnMountHook(() => ref.activate());
  anchor.registerOnUnmountHook(() => ref.deactivate());
  return anchor;
};

class WDerivationCache {
  cache = /* @__PURE__ */ new Map();
  deriveValue;
  constructor(deriveValue) {
    this.deriveValue = deriveValue;
  }
  get(key) {
    this.gc();
    const val = this.cache.get(key)?.deref();
    if (notNullOrUndefined(val)) {
      return val;
    }
    const newVal = this.deriveValue(key);
    this.cache.set(key, new WeakRef(newVal));
    return newVal;
  }
  gc() {
    for (let key of this.cache.keys()) {
      const valRef = this.cache.get(key);
      if (valRef.deref() === void 0) {
        this.cache.delete(key);
      }
    }
  }
}

const nullOrUndefinedNode = new WNode(document.createComment("null"));
const ifElse = (props) => {
  let { condition, ifTrue, ifFalse } = props;
  ifFalse ??= () => nullOrUndefinedNode;
  if (typeof condition === "boolean") {
    return staticIfElse(condition, ifTrue, ifFalse);
  }
  const cache = new WDerivationCache((value) => value ? ifTrue() : ifFalse());
  const anchor = createFragment([]);
  let currentRenderedState;
  let currentRenderedSubtree = nullOrUndefinedNode;
  const ref = runEffect(() => {
    const state = isAtom(condition) ? condition.get() : condition();
    if (state === currentRenderedState) {
      return;
    }
    currentRenderedState = state;
    currentRenderedSubtree = cache.get(state);
    anchor.setChildren([
      currentRenderedSubtree === nullOrUndefinedNode ? null : currentRenderedSubtree
    ]);
  });
  anchor.registerOnUnmountHook(() => ref.deactivate());
  anchor.registerOnMountHook(() => ref.activate());
  return anchor;
};
const staticIfElse = (condition, ifTrue, ifFalse) => {
  const anchor = createFragment([]);
  anchor.setChildren(
    [condition ? ifTrue() : ifFalse()].filter((c) => c !== nullOrUndefinedNode)
  );
  return anchor;
};

const match = (props) => {
  let { state, render } = props;
  const anchor = createFragment([]);
  const matchCache = new WDerivationCache(
    render
  );
  let prevState;
  const ref = runEffect(() => {
    if (prevState === state.get()) {
      return;
    }
    prevState = state.get();
    const content = matchCache.get(prevState);
    anchor.setChildren([content]);
  });
  anchor.registerOnMountHook(() => ref.activate());
  anchor.registerOnUnmountHook(() => ref.deactivate());
  return anchor;
};

const wrapTextInWNode = (content) => {
  if (typeof content === "string") {
    return createTextNode(content);
  } else {
    return content;
  }
};

const createDslElementBuilder = (tag) => {
  return (firstArg, ...remainingChildren) => {
    const adaptedFirstArg = wrapTextInWNode(firstArg);
    const adaptedRemainingChildren = remainingChildren.map(wrapTextInWNode);
    if (nullOrUndefined(adaptedFirstArg)) {
      return createElement(
        tag,
        {},
        []
      );
    } else if (isWNode(adaptedFirstArg)) {
      return createElement(
        tag,
        {},
        [adaptedFirstArg, ...adaptedRemainingChildren]
      );
    } else {
      return createElement(
        tag,
        adaptedFirstArg,
        adaptedRemainingChildren
      );
    }
  };
};
const html = createDslElementBuilder("html");
const base = createDslElementBuilder("base");
const head = createDslElementBuilder("head");
const link = createDslElementBuilder("link");
const meta = createDslElementBuilder("meta");
const style = createDslElementBuilder("style");
const title = createDslElementBuilder("title");
const body = createDslElementBuilder("body");
const address = createDslElementBuilder("address");
const article = createDslElementBuilder("article");
const aside = createDslElementBuilder("aside");
const footer = createDslElementBuilder("footer");
const header = createDslElementBuilder("header");
const h1 = createDslElementBuilder("h1");
const h2 = createDslElementBuilder("h2");
const h3 = createDslElementBuilder("h3");
const h4 = createDslElementBuilder("h4");
const h5 = createDslElementBuilder("h5");
const h6 = createDslElementBuilder("h6");
const main = createDslElementBuilder("main");
const nav = createDslElementBuilder("nav");
const section = createDslElementBuilder("section");
const blockquote = createDslElementBuilder("blockquote");
const dd = createDslElementBuilder("dd");
const div = createDslElementBuilder("div");
const dl = createDslElementBuilder("dl");
const dt = createDslElementBuilder("dt");
const figcaption = createDslElementBuilder("figcaption");
const figure = createDslElementBuilder("figure");
const hr = createDslElementBuilder("hr");
const li = createDslElementBuilder("li");
const menu = createDslElementBuilder("menu");
const ol = createDslElementBuilder("ol");
const p = createDslElementBuilder("p");
const pre = createDslElementBuilder("pre");
const ul = createDslElementBuilder("ul");
const a = createDslElementBuilder("a");
const abbr = createDslElementBuilder("abbr");
const b = createDslElementBuilder("b");
const bdi = createDslElementBuilder("bdi");
const bdo = createDslElementBuilder("bdo");
const br = createDslElementBuilder("br");
const cite = createDslElementBuilder("cite");
const code = createDslElementBuilder("code");
const data = createDslElementBuilder("data");
const dfn = createDslElementBuilder("dfn");
const em = createDslElementBuilder("em");
const i = createDslElementBuilder("i");
const kbd = createDslElementBuilder("kbd");
const mark = createDslElementBuilder("mark");
const q = createDslElementBuilder("q");
const rp = createDslElementBuilder("rp");
const rt = createDslElementBuilder("rt");
const ruby = createDslElementBuilder("ruby");
const s = createDslElementBuilder("s");
const samp = createDslElementBuilder("samp");
const small = createDslElementBuilder("small");
const span = createDslElementBuilder("span");
const string = createDslElementBuilder("strong");
const sub = createDslElementBuilder("sub");
const sup = createDslElementBuilder("sup");
const time = createDslElementBuilder("time");
const mvar = createDslElementBuilder("var");
const wbr = createDslElementBuilder("wbr");
const del = createDslElementBuilder("del");
const ins = createDslElementBuilder("ins");
const caption = createDslElementBuilder("caption");
const col = createDslElementBuilder("col");
const colgroup = createDslElementBuilder("colgroup");
const table = createDslElementBuilder("table");
const tbody = createDslElementBuilder("tbody");
const td = createDslElementBuilder("td");
const tfoot = createDslElementBuilder("tfoot");
const th = createDslElementBuilder("th");
const thead = createDslElementBuilder("thead");
const tr = createDslElementBuilder("tr");
const button = createDslElementBuilder("button");
const datalist = createDslElementBuilder("datalist");
const fieldset = createDslElementBuilder("fieldset");
const form = createDslElementBuilder("form");
const input = createDslElementBuilder("input");
const label = createDslElementBuilder("label");
const legend = createDslElementBuilder("legend");
const meter = createDslElementBuilder("meter");
const optgroup = createDslElementBuilder("optgroup");
const option = createDslElementBuilder("option");
const output = createDslElementBuilder("output");
const progress = createDslElementBuilder("progress");
const select = createDslElementBuilder("select");
const textarea = createDslElementBuilder("textarea");
const details = createDslElementBuilder("details");
const dialog = createDslElementBuilder("dialog");
const summary = createDslElementBuilder("summary");
const frag = (...children) => createFragment(children);
const t = (content) => createTextNode(content);

const suspense = (props, child) => {
  const anchor = createFragment([]);
  if (notNullOrUndefined(props.fallback)) {
    anchor.setChildren([props.fallback]);
  }
  child.then((c) => anchor.setChildren([c]));
  return anchor;
};

const runApp = (anchor, app) => {
  anchor.$$$recoilVElementWrapper = createElement(anchor, {}, [
    app
  ]).mount();
};

const Supply = (props) => {
  const node = frag();
  const ref = runEffect(() => {
    node.setChildren([props.getChild()]);
  });
  node.registerOnMountHook(() => ref.activate());
  node.registerOnUnmountHook(() => ref.deactivate());
  return node;
};
const For = (props) => {
  return forEach(props);
};
const If = (props) => {
  return ifElse({
    condition: props.condition,
    ifTrue: props.true,
    ifFalse: props.false
  });
};
const Switch = (props) => {
  const caseMatchMap = new Map(props.cases);
  return match({
    state: props.value,
    render: (value) => {
      const result = caseMatchMap.get(value) ?? props.default ?? (() => createFragment([]));
      return result();
    }
  });
};
const Suspense = (props, ...children) => {
  const anchor = frag();
  if (notNullOrUndefined(props.default)) {
    anchor.setChildren([props.default]);
  }
  Promise.all(children).then((syncChildren) => {
    anchor.setChildren(syncChildren);
  });
  return anchor;
};

const Fragment = Symbol();
const jsx = (tag, props, ...children) => {
  if (tag === Fragment) {
    return frag(...children);
  }
  if (typeof tag === "function") {
    return tag(
      props,
      ...children
    );
  }
  if (typeof tag !== "string") {
    throw new Error("tag type not supported");
  }
  return createElement(tag, props, [
    ...children
  ]);
};

const $ = (data) => {
  if (isAtom(data)) {
    return createTextNode(data.map((v) => v.toString()));
  } else if (typeof data === "function") {
    return createTextNode(deriveState(() => data().toString()));
  } else {
    return createTextNode(data.toString());
  }
};

exports.$ = $;
exports.ExecutionScopeManager = ExecutionScopeManager;
exports.For = For;
exports.Fragment = Fragment;
exports.If = If;
exports.Supply = Supply;
exports.Suspense = Suspense;
exports.Switch = Switch;
exports.SymbolTable = SymbolTable;
exports.WElement = WElement;
exports.WNode = WNode;
exports.a = a;
exports.abbr = abbr;
exports.address = address;
exports.article = article;
exports.aside = aside;
exports.b = b;
exports.base = base;
exports.bdi = bdi;
exports.bdo = bdo;
exports.blockquote = blockquote;
exports.body = body;
exports.br = br;
exports.button = button;
exports.caption = caption;
exports.captureContextState = captureContextState;
exports.cite = cite;
exports.code = code;
exports.col = col;
exports.colgroup = colgroup;
exports.createElement = createElement;
exports.createFragment = createFragment;
exports.createState = createState;
exports.createTextNode = createTextNode;
exports.data = data;
exports.datalist = datalist;
exports.dd = dd;
exports.defer = defer;
exports.del = del;
exports.deregisterDecorator = deregisterDecorator;
exports.deriveState = deriveState;
exports.derivedState = derivedState;
exports.details = details;
exports.dfn = dfn;
exports.dialog = dialog;
exports.div = div;
exports.dl = dl;
exports.dt = dt;
exports.em = em;
exports.fetchState = fetchState;
exports.fieldset = fieldset;
exports.figcaption = figcaption;
exports.figure = figure;
exports.footer = footer;
exports.forEach = forEach;
exports.form = form;
exports.frag = frag;
exports.h1 = h1;
exports.h2 = h2;
exports.h3 = h3;
exports.h4 = h4;
exports.h5 = h5;
exports.h6 = h6;
exports.head = head;
exports.header = header;
exports.hr = hr;
exports.html = html;
exports.i = i;
exports.ifElse = ifElse;
exports.inject = inject;
exports.input = input;
exports.ins = ins;
exports.isAtom = isAtom;
exports.isWNode = isWNode;
exports.jsx = jsx;
exports.kbd = kbd;
exports.label = label;
exports.lazy = lazy;
exports.legend = legend;
exports.li = li;
exports.link = link;
exports.main = main;
exports.mark = mark;
exports.match = match;
exports.menu = menu;
exports.meta = meta;
exports.meter = meter;
exports.mvar = mvar;
exports.nav = nav;
exports.ol = ol;
exports.onInitialMount = onInitialMount;
exports.onMount = onMount;
exports.onUnmount = onUnmount;
exports.optgroup = optgroup;
exports.option = option;
exports.output = output;
exports.p = p;
exports.pre = pre;
exports.progress = progress;
exports.provide = provide;
exports.q = q;
exports.registerDecorator = registerDecorator;
exports.rp = rp;
exports.rt = rt;
exports.ruby = ruby;
exports.runApp = runApp;
exports.runBatched = runBatched;
exports.runEffect = runEffect;
exports.runMountedEffect = runMountedEffect;
exports.runUntracked = runUntracked;
exports.s = s;
exports.samp = samp;
exports.section = section;
exports.select = select;
exports.small = small;
exports.span = span;
exports.state = state;
exports.string = string;
exports.style = style;
exports.sub = sub;
exports.summary = summary;
exports.sup = sup;
exports.suspense = suspense;
exports.t = t;
exports.table = table;
exports.tbody = tbody;
exports.td = td;
exports.textarea = textarea;
exports.tfoot = tfoot;
exports.th = th;
exports.thead = thead;
exports.time = time;
exports.title = title;
exports.tr = tr;
exports.ul = ul;
exports.wbr = wbr;
exports.withContext = withContext;
//# sourceMappingURL=bundle.js.map
