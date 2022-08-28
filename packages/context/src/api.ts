import {SymbolKey, ExecutionScopeManager} from "./inject";
import { Consumer, Producer, Runnable, Supplier } from "utils";
import {WElement, WNode} from "dom";
import { ISideEffectRef, runEffect } from "atom";
import { nonEmpty } from "utils/src/type_check";

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

const contextDeferredCallbackRegistry = new DeferredContextCallbackRegistry<WElement<HTMLElement>>();

export const defer = (deferredFunction: Consumer<WElement<HTMLElement>>): void => {
  contextDeferredCallbackRegistry.defer(deferredFunction);
}

export const onInitialMount = (fn: Runnable): void => {
  let called: boolean = false;
  defer((node) =>
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
  defer((node) => node.registerOnMountHook(fn));
};

export const onUnmount = (fn: Runnable): void => {
  defer((node) => node.registerOnUnmountHook(fn));
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
  defer((node) =>
    node.registerOnMountHook(ref.activate.bind(ref))
  );
  defer((node) =>
    node.registerOnUnmountHook(ref.deactivate.bind(ref))
  );
};

const scopeManager = new ExecutionScopeManager();

/**
 * A type safe DI provider analogous to that provided by the vue composition API.
 *
 * @param key The injection key.
 * @param value The raw value.
 */
export const provide = <T>(key: SymbolKey<T>, value: T): void => {
  scopeManager.getCurrentScope().set(key, value);
};

/**
 * Returns the value registered against the key, in the current components scope.
 *
 * This is a tracked operation.
 *
 * @param key The injection key.
 */
export const inject = <T>(key: SymbolKey<T>): T | undefined => {
  return scopeManager.getCurrentScope().get(key);
};

/**
 * Decorates the provided component with a context, allowing the hooks provided by this api
 * to be used.
 *
 * @param component A context builder
 */
export const withContext = <
  Args extends unknown[],
  ReturnNode extends WElement<HTMLElement>
>(component: (...args: [...Args]) => ReturnNode) => {
  return scopeManager.withChildScope((...args: [...Args]) => {
    // runs the registered callbacks against the returned WElement
    return contextDeferredCallbackRegistry.execute(() => {
      return component(...args);
    });
  });
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
export const captureContextState = scopeManager.withCurrentScope.bind(scopeManager);
