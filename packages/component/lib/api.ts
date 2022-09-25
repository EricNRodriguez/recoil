import { SymbolKey, ExecutionScopeManager } from "./inject";
import {
  DecoratableApiFunctionBuilder,
  Runnable,
  F,
  FDecorator,
  Producer,
  Consumer,
} from "shared";
import { WElement, WNode } from "recoiljs-dom";
import { ISideEffectRef } from "recoiljs-atom";
import { runEffect } from "recoiljs-atom";
import { defer, execute } from "./defer";

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
 * Runs a side effect against the dom subtree enclosed by this component
 *
 * The effect will be automatically activated/deactivated with the mounting/unmounting
 * of the component, preventing unnecessary background updates to the dom.
 *
 * @param sideEffect The side effect that will be re-run every time its deps are dirtied.
 */
export const runMountedEffect = (sideEffect: Runnable): void => {
  const ref: ISideEffectRef = runEffect(sideEffect);
  defer((node) => node.registerOnMountHook(ref.activate.bind(ref)));
  defer((node) => node.registerOnUnmountHook(ref.deactivate.bind(ref)));
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
  <Args extends unknown[], ReturnNode extends WNode<Node>>(
    component: F<Args, ReturnNode>
  ) => {
    return scopeManager.withChildScope((...args: [...Args]) => {
      return execute(() => {
        return component(...args);
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
  (fn: Producer<WNode<Node>>): Producer<WNode<Node>> => {
    return scopeManager.withCurrentScope(fn);
  }
);

export type MakeLazyDecorator = FDecorator<
  Parameters<typeof makeLazy>,
  ReturnType<typeof makeLazy>
>;
export const decorateMakeLazy: Consumer<MakeLazyDecorator> = (decorator) =>
  apiFunctionBuilder.registerDecorator(makeLazy, decorator);