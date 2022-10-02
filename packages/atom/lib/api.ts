import { IMutableAtom, ISideEffectRef } from "./atom.interface";
import {
  MutableAtom,
  DerivedAtom,
  SideEffect,
  VirtualDerivedAtom,
} from "./atom";
import { IAtom } from "./atom.interface";
import { F, FDecorator, Producer, Runnable } from "shared";
import { AtomTrackingContext } from "./context";
import {BatchingEffectScheduler, BatchingUpdateExecutor, EffectPriority} from "./scheduling";
import { DecoratableApiFunctionBuilder } from "shared";

/**
 * A shared tracking component for all atoms created through this api
 */
const globalTrackingContext = new AtomTrackingContext();

/**
 * A shared side effect scheduler that provides support for batching updates
 */
const globalEffectScheduler = new BatchingEffectScheduler();

/**
 * A shared update executor that is used by all mutable atoms in the DAG. Internally
 * this allows us to inject all effect scheduling logic into atoms and couple them, through
 * DI alone.
 *
 * This implementation will simply execute the update as a batch. The overhead to this is low
 * and allows us to use the same logic for priority scheduling of effects for both unit updates
 * and batch updates.
 */
const globalUpdateExecutor = new BatchingUpdateExecutor(globalEffectScheduler);

/**
 * A utility that allows runtime decoration of the constructed api functions
 */
const apiFunctionBuilder: DecoratableApiFunctionBuilder =
  new DecoratableApiFunctionBuilder();

/**
 * Registers a runtime decorator against one of the public factory methods exposed by this module.
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be applied for all subsequent calls of the apiFn
 */
export const registerDecorator = <Args extends unknown[], ReturnType>(
  apiFn: F<Args, ReturnType>,
  decorator: FDecorator<Args, ReturnType>
): void => {
  return apiFunctionBuilder.registerDecorator(apiFn, decorator);
};

/**
 * De-registers decorators that have been applied to the provided apiFn (i.e. createState etc)
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be removed
 */
export const deregisterDecorator = <Args extends unknown[], ReturnType>(
  apiFn: F<Args, ReturnType>,
  decorator: FDecorator<Args, ReturnType>
): void => {
  return apiFunctionBuilder.deregisterDecorator(apiFn, decorator);
};

export type FetchStateSignature<T> = (
  fetch: () => Promise<T>
) => IAtom<T | undefined>;

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
export const fetchState = apiFunctionBuilder.build(
  <T>(producer: Producer<Promise<T>>): IAtom<T | undefined> => {
    let reactionVersion: number = 0;
    let writeVersion: number = 0;

    const atom = new MutableAtom<T | undefined>(
      undefined,
      globalTrackingContext,
      globalUpdateExecutor
    );

    const sideEffectRunnable = (): void => {
      let currentReactionVersion = reactionVersion++;
      producer().then((val: T): void => {
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

    const ref = new SideEffect(
      sideEffectRunnable,
      globalTrackingContext,
      globalEffectScheduler,
      EffectPriority.MAJOR,
    );
    ref.run();

    (atom as any).$$$recoilFetchStateDerivation = ref;

    return atom;
  }
);

export type CreateStateSignature<T> = (value: T) => IMutableAtom<T>;

/**
 * A factory method for a mutable atom instance.
 *
 * @param value The value to be stored in the atom.
 * @returns The atom
 */
export const createState = apiFunctionBuilder.build(
  <T>(value: T): IMutableAtom<T> => {
    return new MutableAtom(value, globalTrackingContext, globalUpdateExecutor);
  }
);

export type DeriveStateSignature<T> = (derivation: () => T) => IAtom<T>;

/**
 * A factory method for a derived state.
 *
 * The returned atom is dirtied whenever any atomic dependencies used within the
 * derivation are dirtied. Evaluation can either be lazy or eager, depending on
 * the effects registered against it.
 *
 * Which computations to wrap in cached derivations should be considered carefully, ideally through profiling. This
 * is because all writes to mutable atoms have a linear time complexity on the depth of the dependency DAG. Hence,
 * they should be used as tracked cache (memoization) primitive.
 *
 * @param deriveValue A synchronous factory for the state
 * @param cache Determines if the returned Atom is a skip connection in the DAG or an actual node.
 * @returns An atom containing the derived state, which automatically tracks the dependencies that were used to
 *          create it
 */
export const deriveState = apiFunctionBuilder.build(
  <T>(deriveValue: Producer<T>, cache: boolean = true): IAtom<T> => {
    if (cache) {
      return new DerivedAtom(
        deriveValue,
        globalTrackingContext,
        globalUpdateExecutor
      );
    } else {
      return new VirtualDerivedAtom(
        globalTrackingContext,
        deriveValue,
        globalUpdateExecutor
      );
    }
  }
);

export type RunEffectSignature = (effect: Runnable, priority: EffectPriority) => ISideEffectRef;

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
export const runEffect: RunEffectSignature = apiFunctionBuilder.build(
  (effect: Runnable, priority: EffectPriority = EffectPriority.MINOR): ISideEffectRef => {
    const sideEffect: SideEffect = new SideEffect(
      effect,
      globalTrackingContext,
      globalEffectScheduler,
      priority,
    );

    sideEffect.run();

    return sideEffect;
  }
);

/**
 * A utility decorator that auto-wraps instance variables in atoms, and overrides the set and get methods
 * such that they write/read to the atom.
 */
export const state = apiFunctionBuilder.build((): void | any => {
  const registry: WeakMap<Object, IMutableAtom<any>> = new WeakMap<
    Object,
    IMutableAtom<any>
  >();

  return function (target: Object, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      set: function (this, newVal: any) {
        if (!registry.has(this)) {
          registry.set(
            this,
            new MutableAtom(newVal, globalTrackingContext, globalUpdateExecutor)
          );
        } else {
          registry.get(this)!.set(newVal);
        }
      },
      get: function (): any {
        return registry.get(this)!.get();
      },
    });
  };
});

/**
 * A utility decorator that auto-wraps methods in derived atoms.
 */
export const derivedState = apiFunctionBuilder.build((): string | any => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): any => {
    const registry: WeakMap<Object, DerivedAtom<any>> = new WeakMap();
    const originalFn = descriptor.value;

    descriptor.value = function (...args: any[]): any {
      if (!registry.has(this)) {
        registry.set(
          this,
          new DerivedAtom(
            () => {
              return originalFn.apply(this, args);
            },
            globalTrackingContext,
            globalUpdateExecutor
          )
        );
      }
      return registry.get(this)!.get();
    };
  };
});

/**
 * Executes a callback that is not tracked by external contexts. I.e. reads made within the callback
 * will be made outside any external tracking scopes.
 *
 * @param job The callback to execute in an untracked component
 */
export const runUntracked = <T>(job: Producer<T>): T => {
  try {
    globalTrackingContext.enterNewTrackingContext();
    return job();
  } finally {
    globalTrackingContext.exitCurrentTrackingContext();
  }
};

/**
 * Executes a job in a batched component, such that all eager side effects will be run after the job returns.
 * This is typically useful if you have an invalid intermediate state that is invalid and should never be used
 * in any effects.
 *
 * @param job The job to be run in a batched state, with all effects running after the job completes.
 */
export const runBatched = <ReturnType>(job: Producer<ReturnType>): ReturnType => globalEffectScheduler.executeAsBatch(job);
