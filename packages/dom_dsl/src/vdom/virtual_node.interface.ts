import { Runnable } from "../../../util";
import { SideEffectRef } from "../../../atom";

// A lightweight wrapper around a raw node
export interface VNode<A, B extends VNode<A, B>> {
  mount(): B;
  unmount(): B;
  isMounted(): boolean;
  registerSideEffect(ref: SideEffectRef): B;
  registerOnMountHook(hook: Runnable): B;
  registerOnUnmountHook(hook: Runnable): B;
  getRaw(): A;
}
