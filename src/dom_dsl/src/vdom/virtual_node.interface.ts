import {Runnable} from "../../../atom/src/util.interface";

// A lightweight wrapper around a raw node
export interface VNode<A, B extends VNode<A, B>> {
    mount(): B;
    unmount(): B;
    isMounted(): boolean;
    registerSideEffect(effect: Runnable): B;
    registerOnMountHook(hook: Runnable): B;
    registerOnUnmountHook(hook: Runnable): B;
    getRaw(): A;
}