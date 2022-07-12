import {SideEffectRef} from "../../../atom";

export interface VNode<A, B extends VNode<A, B>> {
    mount(): VNode<A, B>;
    unmount(): VNode<A, B>;
    isMounted(): boolean;
    registerEffect(effect: SideEffectRef): VNode<A,B>;
    getRaw(): A;
}