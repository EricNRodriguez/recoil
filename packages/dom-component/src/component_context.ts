import {VNode} from "../../vdom";
import {
  createState,
  deriveState,
  fetchState,
  IAtom,
  ILeafAtom,
  ISideEffectRef,
  runEffect
} from "../../atom";
import {Consumer, Producer, Runnable} from "../../util";

export interface IComponentContext {
  runEffect(sideEffect: Runnable): void;
  onMount(sideEffect: Runnable): void;
  onInitialMount(sideEffect: Runnable): void;
  onUnmount(sideEffect: Runnable): void;
}

export class ComponentContext implements IComponentContext {
  private readonly deferredFunctions: Consumer<VNode<Node>>[] = [];

  public createState<T>(value: T): ILeafAtom<T> {
    return createState(value);
  }

  public deriveState<T>(derivation: Producer<T>): IAtom<T> {
    return deriveState(derivation);
  }

  public fetchState<T>(fetcher: Producer<Promise<T>>): IAtom<T | undefined> {
    return fetchState(fetcher);
  }

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

  public applyDeferredFunctions(node: VNode<Node>): void {
    this.deferredFunctions.forEach((fn) => fn(node));
  }
}
