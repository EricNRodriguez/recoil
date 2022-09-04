'use strict';Object.defineProperty(exports,'__esModule',{value:true});var atom=require('atom'),type_check=require('shared/type_check');class SymbolTable {
  constructor() {
    this.symbols = [/* @__PURE__ */ new Map()];
  }
  fork() {
    const child = new SymbolTable();
    child.symbols.length = 0;
    child.symbols.push(...this.symbols, /* @__PURE__ */ new Map());
    return child;
  }
  set(key, value) {
    if (this.symbols[this.symbols.length - 1].has(key)) {
      atom.runUntracked(
        () => {
          var _a;
          return (_a = this.symbols[this.symbols.length - 1].get(key)) == null ? void 0 : _a.set(value);
        }
      );
    } else {
      this.symbols[this.symbols.length - 1].set(key, atom.createState(value));
    }
  }
  get(key) {
    var _a;
    for (let i = this.symbols.length - 1; i >= 0; --i) {
      if (this.symbols[i].has(key)) {
        return (_a = this.symbols[i].get(key)) == null ? void 0 : _a.get();
      }
    }
    return void 0;
  }
}
class ExecutionScopeManager {
  constructor() {
    this.currentScope = new SymbolTable();
  }
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
}class DeferredContextCallbackRegistry {
  constructor() {
    this.scope = [];
  }
  defer(fn) {
    if (!type_check.nonEmpty(this.scope)) {
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
  const ref = atom.runEffect(sideEffect);
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
const captureContextState = scopeManager.withCurrentScope.bind(scopeManager);exports.ExecutionScopeManager=ExecutionScopeManager;exports.SymbolTable=SymbolTable;exports.captureContextState=captureContextState;exports.defer=defer;exports.inject=inject;exports.onInitialMount=onInitialMount;exports.onMount=onMount;exports.onUnmount=onUnmount;exports.provide=provide;exports.runMountedEffect=runMountedEffect;exports.withContext=withContext;//# sourceMappingURL=context.js.map
