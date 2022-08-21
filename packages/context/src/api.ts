import { InjectionKey, ScopedInjectionRegistry } from "./inject";
import { Consumer, Producer, Runnable, Supplier } from "../../util";
import { WNode } from "../../dom";
import { ISideEffectRef, runEffect } from "../../atom";
import { nonEmpty } from "../../util/src/type_check";

class DeferredContextCallbackRegistry<T extends WNode<Node>> {
  private readonly scope: Consumer<T>[][] = [];

  public defer(fn: Consumer<T>): void {
    if (!nonEmpty(this.scope)) {
      throw new Error("unable to defer functions outside of a scope");
    }

    this.scope[this.scope.length - 1].push(fn);
  }

  public execute<R extends T>(job: Producer<R>): R {
    try {
      this.scope.push([]);
      const result: R = job();
      this.scope[this.scope.length - 1].forEach((fn: Consumer<T>) =>
        fn(result)
      );
      return result;
    } finally {
      this.scope.pop();
    }
  }
}

const contextDeferredCallbackRegistry = new DeferredContextCallbackRegistry<
  WNode<Node>
>();

export const onInitialMount = (fn: Runnable): void => {
  let called: boolean = false;
  contextDeferredCallbackRegistry.defer((node) =>
    node.registerOnMountHook(() => {
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

export const onMount = (fn: Runnable): void => {
  contextDeferredCallbackRegistry.defer((node) => node.registerOnMountHook(fn));
};

export const onUnmount = (fn: Runnable): void => {
  contextDeferredCallbackRegistry.defer((node) => node.registerOnMountHook(fn));
};

/**
 * Runs a side effect against the dom subtree enclosed by this context
 *
 * The effect will be automatically activated/deactivated with the mounting/unmounting
 * of the context, preventing unnecessary background updates to the dom.
 *
 * @param sideEffect The side effect that will be re-run every time its deps are dirtied.
 */
export const runMountedEffect = (sideEffect: Runnable): void => {
  const ref: ISideEffectRef = runEffect(sideEffect);
  contextDeferredCallbackRegistry.defer((node) =>
    node.registerOnMountHook(ref.activate.bind(ref))
  );
  contextDeferredCallbackRegistry.defer((node) =>
    node.registerOnUnmountHook(ref.deactivate.bind(ref))
  );
};

let globalInjectionScope = new ScopedInjectionRegistry();

/**
 * A type safe DI provider analogous to that provided by the vue composition API.
 *
 * @param key The injection key.
 * @param value The raw value.
 */
export const provide = <T>(key: InjectionKey<T>, value: T): void => {
  globalInjectionScope.set(key, value);
};

/**
 * Returns the value registered against the key, in the current components scope.
 *
 * This is a tracked operation.
 *
 * @param key The injection key.
 */
export const inject = <T>(key: InjectionKey<T>): T | undefined => {
  return globalInjectionScope.get(key);
};

const runInInjectionScope = <T>(fn: Producer<T>): T => {
  const parentScope = globalInjectionScope;

  // At first sight it might seem unintuitive / stupid that we are forking instead of pushing a new scope, however
  // in order to make provide calls made inside callbacks that execute after a builder has returned work as
  // you would expect, we need to fork and never pop. This allows for the same 'scoped' behaviour, but also
  // allows callbacks to work intuitively.
  globalInjectionScope = parentScope.fork();

  try {
    return fn();
  } finally {
    globalInjectionScope = parentScope;
  }
};

/**
 * Decorates the provided component with a context, allowing the hooks provided by this api
 * to be used.
 *
 * @param component A context builder
 */
export const withContext = <
  Args extends unknown[],
  ReturnNode extends WNode<Node>
>(
  component: (
    ...args: [...Args]
  ) => ReturnNode
) => {
  return (...args: [...Args]) => {
    return runInInjectionScope<ReturnNode>(() =>
      contextDeferredCallbackRegistry.execute(() => {
        return component(...args);
      })
    );
  };
};

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
export const closeOverContextState = <Args extends unknown[], ReturnType>(
  fn: (...args: [...Args]) => ReturnType
): typeof fn => {
  const capturedInjectionScope: ScopedInjectionRegistry =
    globalInjectionScope.fork();
  return (...args: [...Args]): ReturnType => {
    const currentInjectionScope: ScopedInjectionRegistry = globalInjectionScope;
    globalInjectionScope = capturedInjectionScope;
    try {
      return fn(...args);
    } finally {
      globalInjectionScope = currentInjectionScope;
    }
  };
};
