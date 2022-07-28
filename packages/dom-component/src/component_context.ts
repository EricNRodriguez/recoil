import { WNode } from "../../dom";
import { ISideEffectRef, runEffect } from "../../atom";
import { Consumer, Runnable } from "../../util";

export interface IComponentContext {
  runEffect(sideEffect: Runnable): void;
  onMount(sideEffect: Runnable): void;
  onInitialMount(sideEffect: Runnable): void;
  onUnmount(sideEffect: Runnable): void;
  onCleanup(finalizer: Runnable): void;
  onClick(fn: Consumer<MouseEvent>): void;
}

export class ComponentContext implements IComponentContext {
  private static readonly registeredFinalizers: WeakMap<Object, Runnable[]> =
    new WeakMap<Object>();
  private static readonly finalizationRegistry: FinalizationRegistry<Object> =
    new FinalizationRegistry<Object>((id: Object) => {
      this.registeredFinalizers.get(id)?.forEach((fn) => fn());
    });

  private readonly deferredFunctions: Consumer<WNode<Node>>[] = [];

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

  public onClick(fn: Consumer<MouseEvent>): void {
    this.deferredFunctions.push((node: WNode<Node>) => {
        if (!(node.unwrap() instanceof HTMLElement)) {
          throw new Error("unable to attach event handler to node");
        }

      (node.unwrap() as HTMLElement).addEventListener("click", fn);
    });
  }

  public applyDeferredFunctions(node: WNode<Node>): void {
    this.deferredFunctions.forEach((fn) => fn(node));
  }
}
