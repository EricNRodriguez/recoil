import { WElement, WNode } from "../../dom";
import { ISideEffectRef, runEffect } from "../../atom";
import { Consumer, Runnable } from "../../util";
import { InjectionKey, ScopedInjectionRegistry } from "./inject";

export interface IComponentContext {
  /**
   * Runs a side effect against the components dom subtree.
   *
   * The effect will be automatically activated/deactivated with the mounting/unmounting
   * of the component, preventing unnecessary background updates to the dom.
   *
   * @param sideEffect The side effect that will be re-run every time its deps are dirtied.
   */
  runEffect(sideEffect: Runnable): void;

  onMount(sideEffect: Runnable): void;

  onInitialMount(sideEffect: Runnable): void;

  onUnmount(sideEffect: Runnable): void;

  onCleanup(finalizer: Runnable): void;

  /**
   * A type safe DI provider analogous to that provided by the vue composition API.
   *
   * @param key The injection key.
   * @param value The raw value.
   */
  provide<T>(key: InjectionKey<T>, value: T): void;

  /**
   * Returns the value registered against the key, in the current components scope.
   *
   * This is a tracked operation.
   *
   * @param key The injection key.
   */
  inject<T>(key: InjectionKey<T>): T | undefined;
}

export class ComponentContext implements IComponentContext {
  private static readonly registeredFinalizers: WeakMap<Object, Runnable[]> =
    new WeakMap<Object>();
  private static readonly finalizationRegistry: FinalizationRegistry<Object> =
    new FinalizationRegistry<Object>((id: Object) => {
      this.registeredFinalizers.get(id)?.forEach((fn) => fn());
    });
  private readonly injectionRegistry: ScopedInjectionRegistry;
  private readonly deferredFunctions: Consumer<WNode<Node>>[] = [];

  public constructor(injectionRegistry: ScopedInjectionRegistry) {
    this.injectionRegistry = injectionRegistry;
  }

  public onInitialMount(sideEffect: Runnable): void {
    let called: boolean = false;
    this.deferredFunctions.push((node) =>
      node.registerOnMountHook(() => {
        if (called) {
          return;
        }

        called = true;
        sideEffect();
      })
    );
  }

  public onMount(sideEffect: Runnable): void {
    this.deferredFunctions.push((node) => node.registerOnMountHook(sideEffect));
  }

  public onUnmount(sideEffect: Runnable): void {
    this.deferredFunctions.push((node) =>
      node.registerOnUnmountHook(sideEffect)
    );
  }

  public runEffect(sideEffect: Runnable): void {
    const ref: ISideEffectRef = runEffect(sideEffect);
    this.deferredFunctions.push((node) =>
      node.registerOnMountHook(ref.activate.bind(ref))
    );
    this.deferredFunctions.push((node) =>
      node.registerOnUnmountHook(ref.deactivate.bind(ref))
    );
  }

  public onCleanup(finalizer: Runnable): void {
    this.deferredFunctions.push((node: WNode<Node>) => {
      if (!ComponentContext.registeredFinalizers.has(node.unwrap())) {
        ComponentContext.finalizationRegistry.register(node, node.unwrap());
        ComponentContext.registeredFinalizers.set(node.unwrap(), []);
      }
      ComponentContext.registeredFinalizers.get(node.unwrap())!.push(finalizer);
    });
  }

  public applyDeferredFunctions(element: WNode<Node>): void {
    this.deferredFunctions.forEach((fn) => fn(element));
  }

  public provide<T>(key: InjectionKey<T>, value: T): void {
    this.injectionRegistry.set(key, value);
  }

  public inject<T>(key: InjectionKey<T>): T | undefined {
    return this.injectionRegistry.get(key);
  }
}
