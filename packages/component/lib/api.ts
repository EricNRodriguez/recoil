import { SymbolKey, ExecutionScopeManager } from "./inject";
import {
  DecoratableApiFunctionBuilder,
  Runnable,
  F,
  FDecorator,
  Producer,
  Consumer,
} from "shared";
import { ISideEffectRef, EffectPriority, runBatched } from "recoiljs-atom";
import { runEffect } from "recoiljs-atom";
import { defer, execute } from "./defer";
import {
  registerOnCleanupHook,
  registerOnMountHook,
  registerOnUnmountHook,
} from "recoiljs-dom";

export const onInitialMount = (fn: Runnable): void => {
  let called: boolean = false;
  defer((node) =>
    registerOnMountHook(node, () => {
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
  defer((node) => registerOnMountHook(node, fn));
};

export const onUnmount = (fn: Runnable): void => {
  defer((node) => registerOnUnmountHook(node, fn));
};

export const onCleanup = (fn: Runnable): void => {
  defer((node) => registerOnCleanupHook(node, fn));
};

/**
 * Runs a side effect against the dom subtree enclosed by this component
 *
 * The effect will be automatically activated/deactivated with the mounting/unmounting
 * of the component, preventing unnecessary background updates to the dom.
 *
 * @param sideEffect The side effect that will be re-run every time its deps are dirtied.
 * @param priority The priority of the effect relative to other effects triggered by the dag update.
 *                 Effect with lower priority values will be run earlier.
 */
export const runMountedEffect = (
  sideEffect: Runnable,
  priority: EffectPriority = EffectPriority.MINOR
): void => {
  const ref: ISideEffectRef = runEffect(sideEffect, priority);
  defer((node) => registerOnMountHook(node, ref.activate.bind(ref)));
  defer((node) => registerOnUnmountHook(node, ref.deactivate.bind(ref)));
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

const apiFunctionBuilder = new DecoratableApiFunctionBuilder();

/**
 * Creates a higher level component from a raw dom builder. This method decorates the builder with component
 * specific logic.
 *
 * @param component A component builder
 */
export const createComponent = apiFunctionBuilder.build(
  <Args extends unknown[], ReturnNode extends Node>(
    component: F<Args, ReturnNode>
  ) => {
    // enter new DI child scope
    return scopeManager.withChildScope((...args: [...Args]) => {
      // enter atomic batch, allowing effects to be scheduled during creation
      return runBatched(() => {
        // run and apply all deferred callbacks to the return node
        return execute(() => {
          return component(...args);
        });
      });
    });
  }
);

export type CreateComponentDecorator = FDecorator<
  Parameters<typeof createComponent>,
  ReturnType<typeof createComponent>
>;
export const decorateCreateComponent: Consumer<CreateComponentDecorator> = (
  decorator
) => apiFunctionBuilder.registerDecorator(createComponent, decorator);

/**
 * Wraps a callback inside a closure such that the current component scope is captured and restored for each
 * sub-component run inside the callback, as if it were executed at the time this function is called.
 **
 * @param fn The function to close over the current component scope
 */
export const makeLazy = apiFunctionBuilder.build(
  (fn: Producer<Node>): Producer<Node> => {
    return scopeManager.withCurrentScope(fn);
  }
);

export type MakeLazyDecorator = FDecorator<
  Parameters<typeof makeLazy>,
  ReturnType<typeof makeLazy>
>;
export const decorateMakeLazy: Consumer<MakeLazyDecorator> = (decorator) =>
  apiFunctionBuilder.registerDecorator(makeLazy, decorator);
