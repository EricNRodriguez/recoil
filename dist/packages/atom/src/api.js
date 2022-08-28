"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBatched = exports.runUntracked = exports.derivedState = exports.state = exports.runEffect = exports.deriveState = exports.createState = exports.fetchState = exports.deregisterDecorator = exports.registerDecorator = void 0;
const atom_1 = require("./atom");
const context_1 = require("./context");
const effect_scheduler_1 = require("./effect_scheduler");
/**
 * A shared tracking context for all atoms created through this api
 */
const globalTrackingContext = new context_1.AtomTrackingContext();
/**
 * A shared side effect scheduler that provides support for batching updates
 */
const globalEffectScheduler = new effect_scheduler_1.BatchingEffectScheduler();
/**
 * A utility class that provides runtime decoration to exported functions, implemented as a singleton.
 */
class ApiFunctionBuilder {
    constructor() {
        this.decoratorRegistry = new Map();
        this.baseFuncRegistry = new Map();
    }
    static { this.instance = new ApiFunctionBuilder(); }
    static getInstance() {
        return ApiFunctionBuilder.instance;
    }
    /**
     * A higher order method that provides runtime decoration support to the injected function
     *
     * @param baseFunc The function wrapped by the return function
     * @returns A wrapper function around the injected function, which may be further decorated at runtime.
     */
    build(baseFunc) {
        const externalFunc = ((...args) => {
            return this.composeFunction(externalFunc)(...args);
        });
        this.decoratorRegistry.set(externalFunc, []);
        this.baseFuncRegistry.set(externalFunc, baseFunc);
        return externalFunc;
    }
    /**
     * Registers runtime decorators for methods constructed by the build method
     *
     * @param apiFn The method _returned_ by the build method (not the injected function!)
     * @param decorator The higher order function to wrap the apiFn
     */
    registerDecorator(apiFn, decorator) {
        if (!this.decoratorRegistry.has(apiFn)) {
            // TODO(ericr): more specific error type
            throw new Error("decorating the provided function is not supported");
        }
        this.decoratorRegistry.get(apiFn).push(decorator);
    }
    /**
     * Unregisters any runtime decorators injected via the registerDecorator method
     *
     * @param apiFn The method _returned_ by the build method (not the injected function!)
     * @param decorator The higher order decorator that is to be removed
     */
    deregisterDecorator(apiFn, decorator) {
        this.decoratorRegistry.set(apiFn, (this.decoratorRegistry.get(apiFn) ?? []).filter((dec) => dec !== decorator));
    }
    /**
     * Takes the external function and applies all registered decorators in FIFO order of registration, returning
     * the decorated function. This is done lazily at runtime to enable runtime decoration.
     *
     * @param externalFunc The method _returned_ by the build method
     * @returns The composed function, being the registered base function with all of the currently registered decorators
     *          applied.
     */
    composeFunction(externalFunc) {
        if (!this.baseFuncRegistry.has(externalFunc)) {
            // TODO(ericr): more specific message and type
            throw new Error("unable to compose unknown function");
        }
        const baseFunc = this.baseFuncRegistry.get(externalFunc);
        const decorations = this.decoratorRegistry.get(externalFunc);
        return decorations.reduceRight((composedFunc, decorator) => decorator(composedFunc), baseFunc);
    }
}
/**
 * Registers a runtime decorator against one of the public factory methods exposed by this module.
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be applied for all subsequent calls of the apiFn
 */
const registerDecorator = (apiFn, decorator) => {
    return ApiFunctionBuilder.getInstance().registerDecorator(apiFn, decorator);
};
exports.registerDecorator = registerDecorator;
/**
 * De-registers decorators that have been applied to the provided apiFn (i.e. createState etc)
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be removed
 */
const deregisterDecorator = (apiFn, decorator) => {
    return ApiFunctionBuilder.getInstance().deregisterDecorator(apiFn, decorator);
};
exports.deregisterDecorator = deregisterDecorator;
// TODO(ericr): Support aborting
/**
 * A lightweight primitive that allows state to be fetched asynchronously and written to a reactive atom. Before
 * resolving, the returned atom will have an undefined value.
 *
 * @param producer A synchronous builder for an asynchronous value. It is important that all dependencies that invalidate
 *                 the returned state are read synchronously (i.e. before any async execution). You should think of this
 *                 as a synchronous factory that produces a promise, with this factory being re-run every time its dependencies
 *                 change.
 * @returns A maybe atom containing the fetched state (or undefined in the instance when the state is being fetched)
 */
exports.fetchState = ApiFunctionBuilder.getInstance().build((producer) => {
    let reactionVersion = 0;
    let writeVersion = 0;
    const atom = new atom_1.LeafAtomImpl(undefined, globalTrackingContext);
    const derivation = new atom_1.DerivedAtom(producer, globalTrackingContext);
    const sideEffectRunnable = () => {
        let currentReactionVersion = reactionVersion++;
        derivation.get().then((val) => {
            if (val === undefined) {
                return;
            }
            if (writeVersion > currentReactionVersion) {
                return;
            }
            atom.set(val);
            writeVersion = currentReactionVersion;
        });
    };
    const ref = new atom_1.SideEffect(sideEffectRunnable, globalTrackingContext, globalEffectScheduler);
    ref.run();
    atom.$$$recoilFetchStateDerivation = [derivation, ref];
    return atom;
});
/**
 * A factory method for a leaf atom instance.
 *
 * @param value The value to be stored in the atom.
 * @returns The atom
 */
exports.createState = ApiFunctionBuilder.getInstance().build((value) => {
    return new atom_1.LeafAtomImpl(value, globalTrackingContext);
});
/**
 * A factory method for a derived state.
 *
 * The returned atom is dirtied whenever any atomic dependencies used within the
 * derivation are dirtied. Evaluation can either be lazy or eager, depending on
 * the effects registered against it.
 *
 * Which computations to wrap in cached derivations should be considered carefully, ideally through profiling. This
 * is because all writes to leaf atoms have a linear time complexity on the depth of the dependency DAG. Hence,
 * they should be used as tracked cache (memoization) primitive.
 *
 * @param deriveValue A synchronous factory for the state
 * @param cache Determines if the returned Atom is a skip connection in the DAG or an actual node.
 * @returns An atom containing the derived state, which automatically tracks the dependencies that were used to
 *          create it
 */
exports.deriveState = ApiFunctionBuilder.getInstance().build((deriveValue, cache = true) => {
    if (cache) {
        return new atom_1.DerivedAtom(deriveValue, globalTrackingContext);
    }
    else {
        return new atom_1.VirtualDerivedAtom(globalTrackingContext, deriveValue);
    }
});
/**
 * A factory method for a tracked side effect
 *
 * The effect will be eagerly run once, and again any time any of its dependencies become dirty.
 *
 * It is important that this side effect is state-free, i.e. writes to atoms should be done with extreme
 * caution, as they can easily create reactive loops that are extremely difficult to find.
 *
 * As this is effectively a leaf in the dependency DAG, a reference to the side effect is returned that
 * should be managed by the caller. It provides lifecycle methods for the effect and also ensures that the
 * effect is not garbage collected. Despite this, it is recommended that this function should be decorated with
 * auto-scoping logic that handles reference management instead of doing it ad-hoc.
 *
 * @param effect The side effect
 * @returns A reference to the side effect (see the above doc)
 */
exports.runEffect = ApiFunctionBuilder.getInstance().build((effect) => {
    const sideEffect = new atom_1.SideEffect(effect, globalTrackingContext, globalEffectScheduler);
    sideEffect.run();
    return sideEffect;
});
/**
 * A utility decorator that auto-wraps instance variables in atoms, and overrides the set and get methods
 * such that they write/read to the atom.
 */
exports.state = ApiFunctionBuilder.getInstance().build(() => {
    const registry = new WeakMap();
    return function (target, propertyKey) {
        Object.defineProperty(target, propertyKey, {
            set: function (newVal) {
                if (!registry.has(this)) {
                    registry.set(this, new atom_1.LeafAtomImpl(newVal, globalTrackingContext));
                }
                else {
                    registry.get(this).set(newVal);
                }
            },
            get: function () {
                return registry.get(this).get();
            },
        });
    };
});
/**
 * A utility decorator that auto-wraps methods in derived atoms.
 */
exports.derivedState = ApiFunctionBuilder.getInstance().build(() => {
    return (target, propertyKey, descriptor) => {
        const registry = new WeakMap();
        const originalFn = descriptor.value;
        descriptor.value = function (...args) {
            if (!registry.has(this)) {
                registry.set(this, new atom_1.DerivedAtom(() => {
                    return originalFn.apply(this, args);
                }, globalTrackingContext));
            }
            return registry.get(this).get();
        };
    };
});
/**
 * Executes a callback that is not tracked by external contexts. I.e. reads made within the callback
 * will be made outside any external tracking scopes.
 *
 * @param job The callback to execute in an untracked context
 */
const runUntracked = (job) => {
    try {
        globalTrackingContext.enterNewTrackingContext();
        return job();
    }
    finally {
        globalTrackingContext.exitCurrentTrackingContext();
    }
};
exports.runUntracked = runUntracked;
/**
 * Executes a job in a batched context, such that all eager side effects will be run after the job returns.
 * This is typically useful if you have an invalid intermediate state that is invalid and should never be used
 * in any effects.
 *
 * @param job The job to be run in a batched state, with all effects running after the job completes.
 */
const runBatched = (job) => {
    try {
        globalEffectScheduler.enterBatchState();
        job();
    }
    finally {
        globalEffectScheduler.exitBatchedState();
    }
};
exports.runBatched = runBatched;
