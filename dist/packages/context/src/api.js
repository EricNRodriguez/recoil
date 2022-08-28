"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureContextState = exports.withContext = exports.inject = exports.provide = exports.runMountedEffect = exports.onUnmount = exports.onMount = exports.onInitialMount = exports.defer = void 0;
const inject_1 = require("./inject");
const atom_1 = require("../../atom");
const type_check_1 = require("../../utils/src/type_check");
class DeferredContextCallbackRegistry {
    constructor() {
        this.scope = [];
    }
    defer(fn) {
        if (!(0, type_check_1.nonEmpty)(this.scope)) {
            throw new Error("unable to defer functions outside of a scope");
        }
        this.scope[this.scope.length - 1].push(fn);
    }
    execute(job) {
        try {
            this.scope.push([]);
            const result = job();
            this.scope[this.scope.length - 1].forEach((fn) => fn(result));
            return result;
        }
        finally {
            this.scope.pop();
        }
    }
}
const contextDeferredCallbackRegistry = new DeferredContextCallbackRegistry();
const defer = (deferredFunction) => {
    contextDeferredCallbackRegistry.defer(deferredFunction);
};
exports.defer = defer;
const onInitialMount = (fn) => {
    let called = false;
    (0, exports.defer)((node) => node.registerOnMountHook(() => {
        if (called) {
            return;
        }
        try {
            fn();
        }
        finally {
            called = true;
        }
    }));
};
exports.onInitialMount = onInitialMount;
const onMount = (fn) => {
    (0, exports.defer)((node) => node.registerOnMountHook(fn));
};
exports.onMount = onMount;
const onUnmount = (fn) => {
    (0, exports.defer)((node) => node.registerOnUnmountHook(fn));
};
exports.onUnmount = onUnmount;
/**
 * Runs a side effect against the dom subtree enclosed by this context
 *
 * The effect will be automatically activated/deactivated with the mounting/unmounting
 * of the context, preventing unnecessary background updates to the dom.
 *
 * @param sideEffect The side effect that will be re-run every time its deps are dirtied.
 */
const runMountedEffect = (sideEffect) => {
    const ref = (0, atom_1.runEffect)(sideEffect);
    (0, exports.defer)((node) => node.registerOnMountHook(ref.activate.bind(ref)));
    (0, exports.defer)((node) => node.registerOnUnmountHook(ref.deactivate.bind(ref)));
};
exports.runMountedEffect = runMountedEffect;
const scopeManager = new inject_1.ExecutionScopeManager();
/**
 * A type safe DI provider analogous to that provided by the vue composition API.
 *
 * @param key The injection key.
 * @param value The raw value.
 */
const provide = (key, value) => {
    scopeManager.getCurrentScope().set(key, value);
};
exports.provide = provide;
/**
 * Returns the value registered against the key, in the current components scope.
 *
 * This is a tracked operation.
 *
 * @param key The injection key.
 */
const inject = (key) => {
    return scopeManager.getCurrentScope().get(key);
};
exports.inject = inject;
/**
 * Decorates the provided component with a context, allowing the hooks provided by this api
 * to be used.
 *
 * @param component A context builder
 */
const withContext = (component) => {
    return scopeManager.withChildScope((...args) => {
        // runs the registered callbacks against the returned WElement
        return contextDeferredCallbackRegistry.execute(() => {
            return component(...args);
        });
    });
};
exports.withContext = withContext;
/**
 * Wraps a callback inside a closure such that the current contexts scope state is captured and restored for each
 * sub-context run inside the callback.
 *
 * At this point in time, the only scoped state contained within the context API is that used by the dependency
 * injection code, however this wrapper fn is intended to be a catch-all single point for wiring in this sort of
 * behaviour for any future behaviour that requires similar hierarchical scope.
 *
 * @param fn The function to close over the current context scope
 */
exports.captureContextState = scopeManager.withCurrentScope.bind(scopeManager);
