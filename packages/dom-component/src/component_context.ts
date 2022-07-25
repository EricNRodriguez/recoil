import {VNode} from "../../vdom";
import {
  ISideEffectRef,
  runEffect
} from "../../atom";
import {Consumer, Runnable} from "../../util";

export interface IComponentContext {
  runEffect(sideEffect: Runnable): void;
  onMount(sideEffect: Runnable): void;
  onInitialMount(sideEffect: Runnable): void;
  onUnmount(sideEffect: Runnable): void;
  onCleanup(finalizer: Runnable): void;
}

export class ComponentContext implements IComponentContext {
  private static readonly registeredFinalizers: WeakMap<Object, Runnable[]> = new WeakMap<Object>();
  private static readonly finalizationRegistry: FinalizationRegistry<Object> = new FinalizationRegistry<Object>((id: Object) => {
    this.registeredFinalizers.get(id)?.forEach((fn) => fn());
  });

  private readonly deferredFunctions: Consumer<VNode<Node>>[] = [];

  public onInitialMount(sideEffect: Runnable): void {
    let called: boolean = false;
    this.deferredFunctions.push((node) => node.registerOnMountHook(() => {
      if (called) {
        return;
      }

      called = true;
      sideEffect();
    }));
  }

  public onMount(sideEffect: Runnable): void {
    this.deferredFunctions.push((node) => node.registerOnMountHook(sideEffect));
  }

  public onUnmount(sideEffect: Runnable): void {
    this.deferredFunctions.push((node) => node.registerOnUnmountHook(sideEffect));
  }

  public runEffect(sideEffect: Runnable): void {
    const ref: ISideEffectRef = runEffect(sideEffect);
    this.deferredFunctions.push((node) => node.registerOnMountHook(ref.activate.bind(ref)));
    this.deferredFunctions.push((node) => node.registerOnUnmountHook(ref.deactivate.bind(ref)));
  }

  public onCleanup(finalizer: Runnable): void {
    this.deferredFunctions.push((node: VNode<Node>) => {
      if (!ComponentContext.registeredFinalizers.has(node.getId())) {
        ComponentContext.finalizationRegistry.register(node, node.getId());
        ComponentContext.registeredFinalizers.set(node.getId(), []);
      }
      ComponentContext.registeredFinalizers.get(node.getId())!.push(finalizer);
    });
  }

  public applyDeferredFunctions(node: VNode<Node>): void {
    this.deferredFunctions.forEach((fn) => fn(node));
  }
}
