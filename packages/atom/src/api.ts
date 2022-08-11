import { ILeafAtom, ISideEffectRef } from "./atom.interface";
import { LeafAtomImpl, DerivedAtom, SideEffect } from "./atom";
import { IAtom } from "./atom.interface";
import { Producer, Runnable } from "../../util";
import { AtomTrackingContext } from "./context";
import { BatchingEffectScheduler } from "./effect_scheduler";

/**
 * A shared tracking context for all atoms created through this api
 */
const globalTrackingContext = new AtomTrackingContext();

/**
 * A shared side effect scheduler that provides support for batching updates
 */
const globalEffectScheduler = new BatchingEffectScheduler();

/**
 * A generic higher order function
 */
export type FunctionDecorator<F extends Function> = (fn: F) => F;

/**
 * A utility class that provides runtime decoration to exported functions, implemented as a singleton.
 */
class ApiFunctionBuilder {
  private static instance: ApiFunctionBuilder = new ApiFunctionBuilder();

  private decoratorRegistry: Map<Function, FunctionDecorator<any>[]> =
    new Map();
  private baseFuncRegistry: Map<Function, Function> = new Map();

  public static getInstance(): ApiFunctionBuilder {
    return ApiFunctionBuilder.instance;
  }

  /**
   * A higher order method that provides runtime decoration support to the injected function
   *
   * @param baseFunc The function wrapped by the return function
   * @returns A wrapper function around the injected function, which may be further decorated at runtime.
   */
  public build<F extends Function>(baseFunc: F): F {
    const externalFunc: F = ((...args: any[]): any => {
      return this.composeFunction(externalFunc)(...args);
    }) as unknown as F;

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
  public registerDecorator<F extends Function>(
    apiFn: F,
    decorator: FunctionDecorator<F>
  ): void {
    if (!this.decoratorRegistry.has(apiFn)) {
      // TODO(ericr): more specific error type
      throw new Error("decorating the provided function is not supported");
    }

    this.decoratorRegistry.get(apiFn)!.push(decorator);
  }

  /**
   * Unregisters any runtime decorators injected via the registerDecorator method
   *
   * @param apiFn The method _returned_ by the build method (not the injected function!)
   * @param decorator The higher order decorator that is to be removed
   */
  public deregisterDecorator<F extends Function>(
    apiFn: F,
    decorator: FunctionDecorator<F>
  ): void {
    this.decoratorRegistry.set(
      apiFn,
      (this.decoratorRegistry.get(apiFn) ?? []).filter(
        (dec) => dec !== decorator
      )
    );
  }

  /**
   * Takes the external function and applies all registered decorators in FIFO order of registration, returning
   * the decorated function. This is done lazily at runtime to enable runtime decoration.
   *
   * @param externalFunc The method _returned_ by the build method
   * @returns The composed function, being the registered base function with all of the currently registered decorators
   *          applied.
   */
  private composeFunction<F extends Function>(externalFunc: F): F {
    if (!this.baseFuncRegistry.has(externalFunc)) {
      // TODO(ericr): more specific message and type
      throw new Error("unable to compose unknown function");
    }

    const baseFunc: F = this.baseFuncRegistry.get(externalFunc) as F;
    const decorations: FunctionDecorator<F>[] = this.decoratorRegistry.get(
      externalFunc
    ) as FunctionDecorator<F>[];

    return decorations.reduceRight(
      (composedFunc: F, decorator: FunctionDecorator<F>): F =>
        decorator(composedFunc),
      baseFunc
    );
  }
}

/**
 * Registers a runtime decorator against one of the public factory methods exposed by this module.
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be applied for all subsequent calls of the apiFn
 */
export const registerDecorator = <F extends Function>(
  apiFn: F,
  decorator: FunctionDecorator<F>
): void => {
  return ApiFunctionBuilder.getInstance().registerDecorator(apiFn, decorator);
};

/**
 * De-registers decorators that have been applied to the provided apiFn (i.e. createState etc)
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be removed
 */
export const deregisterDecorator = <F extends Function>(
  apiFn: F,
  decorator: FunctionDecorator<F>
): void => {
  return ApiFunctionBuilder.getInstance().deregisterDecorator(apiFn, decorator);
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
export const fetchState = ApiFunctionBuilder.getInstance().build(
  <T>(producer: Producer<Promise<T>>): IAtom<T | undefined> => {
    let reactionVersion: number = 0;
    let writeVersion: number = 0;

    const atom = new LeafAtomImpl<T | undefined>(
      undefined,
      globalTrackingContext
    );

    const derivation = new DerivedAtom<Promise<T>>(
      producer,
      globalTrackingContext
    );

    const sideEffectRunnable = (): void => {
      let currentReactionVersion = reactionVersion++;
      derivation.get().then((val: T): void => {
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
      globalEffectScheduler
    );
    ref.run();

    (atom as any).$$$recoilFetchStateDerivation = [derivation, ref];

    return atom;
  }
);

export type CreateStateSignature<T> = (value: T) => ILeafAtom<T>;

/**
 * A factory method for a leaf atom instance.
 *
 * @param value The value to be stored in the atom.
 * @returns The atom
 */
export const createState = ApiFunctionBuilder.getInstance().build(
  <T>(value: T): ILeafAtom<T> => {
    return new LeafAtomImpl(value, globalTrackingContext);
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
 * Which computations to wrap in derivations should be considered carefully, ideally through profiling. This
 * is because all writes to leaf atoms have a linear time complexity on the depth of the dependency DAG. Hence,
 * they should be used as tracked cache (memoization) primitive.
 *
 * @param deriveValue A synchronous factory for the state
 * @returns An atom containing the derived state, which automatically tracks the dependencies that were used to
 *          create it
 */
export const deriveState = ApiFunctionBuilder.getInstance().build(
  <T>(deriveValue: Producer<T>): IAtom<T> => {
    return new DerivedAtom(deriveValue, globalTrackingContext);
  }
);

export type RunEffectSignature = (effect: Runnable) => ISideEffectRef;

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
export const runEffect: RunEffectSignature =
  ApiFunctionBuilder.getInstance().build((effect: Runnable): ISideEffectRef => {
    const sideEffect: SideEffect = new SideEffect(
      effect,
      globalTrackingContext,
      globalEffectScheduler
    );

    sideEffect.run();

    return sideEffect;
  });

/**
 * A utility decorator that auto-wraps instance variables in atoms, and overrides the set and get methods
 * such that they write/read to the atom.
 */
export const state = ApiFunctionBuilder.getInstance().build((): void | any => {
  const registry: WeakMap<Object, ILeafAtom<any>> = new WeakMap<
    Object,
    ILeafAtom<any>
  >();

  return function (target: Object, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      set: function (this, newVal: any) {
        if (!registry.has(this)) {
          registry.set(this, new LeafAtomImpl(newVal, globalTrackingContext));
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
export const derivedState = ApiFunctionBuilder.getInstance().build(
  (): string | any => {
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
            new DerivedAtom(() => {
              return originalFn.apply(this, args);
            }, globalTrackingContext)
          );
        }
        return registry.get(this)!.get();
      };
    };
  }
);

/**
 * Executes a callback that is not tracked by external contexts. I.e. reads made within the callback
 * will be made outside any external tracking scopes.
 *
 * @param job The callback to execute in an untracked context
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
 * Executes a job in a batched context, such that all eager side effects will be run after the job returns.
 * This is typically useful if you have an invalid intermediate state that is invalid and should never be used
 * in any effects.
 *
 * @param job The job to be run in a batched state, with all effects running after the job completes.
 */
export const runBatched = (job: Runnable): void => {
  try {
    globalEffectScheduler.enterBatchState();
    job();
  } finally {
    globalEffectScheduler.exitBatchedState();
  }
};
