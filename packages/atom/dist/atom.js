'use strict';Object.defineProperty(exports,'__esModule',{value:true});var typescriptMonads=require('typescript-monads');class StatefulSideEffectError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = "StatefulSideEffectError";
    this.stack = new Error().stack;
  }
}class WeakCollection {
  constructor() {
    this.items = [];
    this.itemsSet = /* @__PURE__ */ new WeakSet([]);
  }
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
}const isAtom = (obj) => {
  return obj instanceof Object && "get" in obj && "getUntracked" in obj && "invalidate" in obj && "map" in obj;
};
class BaseAtom {
  constructor(context) {
    this.parents = new WeakCollection();
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
  constructor(deriveValue, context) {
    super(context);
    this.value = typescriptMonads.Maybe.none();
    this.numChildrenNotReady = 0;
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
  constructor(effect, context, effectScheduler) {
    this.numChildrenNotReady = 0;
    this.state = { status: "active" /* ACTIVE */ };
    this.runScoped = () => {
      try {
        this.context.pushParent(this);
        this.effect();
      } finally {
        this.context.popParent();
      }
    };
    this.effect = effect;
    this.context = context;
    this.effectScheduler = effectScheduler;
  }
  run() {
    this.effectScheduler.schedule(this.runScoped);
  }
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
}class AtomTrackingContext {
  constructor() {
    this.scopeStack = [[]];
  }
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
}class BatchingEffectScheduler {
  constructor() {
    this.state = { kind: "eager" /* EAGER */ };
  }
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
}const globalTrackingContext = new AtomTrackingContext();
const globalEffectScheduler = new BatchingEffectScheduler();
const _ApiFunctionBuilder = class {
  constructor() {
    this.decoratorRegistry = /* @__PURE__ */ new Map();
    this.baseFuncRegistry = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return _ApiFunctionBuilder.instance;
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
    var _a;
    this.decoratorRegistry.set(
      apiFn,
      ((_a = this.decoratorRegistry.get(apiFn)) != null ? _a : []).filter(
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
};
let ApiFunctionBuilder = _ApiFunctionBuilder;
ApiFunctionBuilder.instance = new _ApiFunctionBuilder();
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
};exports.createState=createState;exports.deregisterDecorator=deregisterDecorator;exports.deriveState=deriveState;exports.derivedState=derivedState;exports.fetchState=fetchState;exports.isAtom=isAtom;exports.registerDecorator=registerDecorator;exports.runBatched=runBatched;exports.runEffect=runEffect;exports.runUntracked=runUntracked;exports.state=state;//# sourceMappingURL=atom.js.map
