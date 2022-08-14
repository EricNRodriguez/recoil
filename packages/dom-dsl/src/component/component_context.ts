import { WElement, WNode } from "../../../dom";
import { ISideEffectRef, runEffect } from "../../../atom";
import { Consumer, Runnable } from "../../../util";
import { InjectionKey, InjectionRegistry } from "./inject";

export interface IComponentContext {
  runEffect(sideEffect: Runnable): void;

  onMount(sideEffect: Runnable): void;

  onInitialMount(sideEffect: Runnable): void;

  onUnmount(sideEffect: Runnable): void;

  onCleanup(finalizer: Runnable): void;

  provide<T>(key: InjectionKey<T>, value: T): void;

  inject<T>(key: InjectionKey<T>): T | undefined;
}

export class ComponentContext implements IComponentContext {
  private static readonly registeredFinalizers: WeakMap<Object, Runnable[]> =
    new WeakMap<Object>();
  private static readonly finalizationRegistry: FinalizationRegistry<Object> =
    new FinalizationRegistry<Object>((id: Object) => {
      this.registeredFinalizers.get(id)?.forEach((fn) => fn());
    });
  private readonly injectionRegistry: InjectionRegistry;
  private readonly deferredFunctions: Consumer<WNode<Node>>[] = [];

  public constructor(injectionRegistry: InjectionRegistry) {
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
