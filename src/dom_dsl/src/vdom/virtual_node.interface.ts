import {Runnable} from "../../../atom/src/util.interface";

// A lightweight wrapper around a raw node
export interface VNode<A, B extends VNode<A, B>> {
    mount(): VNode<A, B>;
    unmount(): VNode<A, B>;
    isMounted(): boolean;
    registerSideEffect(effect: Runnable): VNode<A, B>;
    getRaw(): A;
}