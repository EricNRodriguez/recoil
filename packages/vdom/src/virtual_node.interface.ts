import {Runnable} from "../../util";

export interface VNode<A, B extends VNode<A, B>> {
  mount(): B;
  unmount(): B;
  isMounted(): boolean;
  registerOnMountHook(hook: Runnable): B;
  registerOnUnmountHook(hook: Runnable): B;
  deleteChildren(offset: number): B;
  setChildren(...children: (VNode<any, VNode<any, any>>)[]): B;
  appendChildren(
    children: (VNode<any, any> | Node | null | undefined)[]
  ): B;
  getRaw(): A;
}
