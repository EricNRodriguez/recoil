import {SideEffectRef} from "../../../atom";

export interface VNode<A extends Node, B extends VNode<A, B>> {
    mount(): VNode<A, B>;
    unmount(): VNode<A, B>;
    registerEffect(effect: SideEffectRef): VNode<A,B>;
    getRaw(): A;
}