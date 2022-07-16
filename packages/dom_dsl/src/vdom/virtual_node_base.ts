import { VNode } from "./virtual_node.interface";
import { runEffect, SideEffectRef } from "../../../atom";
import { Runnable } from "../../../util";

export abstract class VNodeBase<A, B extends VNodeBase<A, B>>
  implements VNode<A, B>
{
  private readonly node: A;
  private readonly rootEffects: Set<SideEffectRef> = new Set<SideEffectRef>();
  private readonly onMountHooks: Set<Runnable> = new Set<Runnable>();
  private readonly onUnmountHooks: Set<Runnable> = new Set<Runnable>();
  private currentlyMounted: boolean = false;

  constructor(node: A) {
    this.node = node;
  }

  // registers an effect that should be activated/deactivated as the
  // element is mounted/unmounted from the dom.
  //
  // registration should be treated as a change of ownership of the effect
  public registerSideEffect(effect: Runnable): B {
    // TODO(ericr): consider an optional arg to avoid eager eval... think it through
    const effectRef: SideEffectRef = runEffect((): void => {
        effect();
      },{
      autoScope: false,
    });
    this.rootEffects.add(effectRef);

    this.isMounted() ? effectRef.activate() : effectRef.deactivate();

    return this as unknown as B;
  }

  public isMounted(): boolean {
    return this.currentlyMounted;
  }

  public mount(): B {
    this.currentlyMounted = true;

    this.activateEffects();
    this.runMountHooks();
    return this as unknown as B;
  }

  public unmount(): B {
    this.currentlyMounted = false;

    this.deactivateEffects();
    this.runUnmountHooks();
    return this as unknown as B;
  }

  private activateEffects(): void {
    this.rootEffects.forEach((ref: SideEffectRef): void => {
      ref.activate();
    });
  }

  private deactivateEffects(): void {
    this.rootEffects.forEach((ref: SideEffectRef): void => {
      ref.deactivate();
    });
  }

  private runUnmountHooks(): void {
    this.onUnmountHooks.forEach((hook) => hook());
  }

  private runMountHooks(): void {
    this.onMountHooks.forEach((hook) => hook());
  }

  public registerOnMountHook(hook: Runnable): B {
    this.onMountHooks.add(hook);

    return this as unknown as B;
  }

  public registerOnUnmountHook(hook: Runnable): B {
    this.onUnmountHooks.add(hook);

    return this as unknown as B;
  }

  public getRaw(): A {
    return this.node;
  }
}
