import {SideEffectRef} from "../../../atom";

export interface VNode<A extends Node, B extends VNode<A, B>> {
    mount(): void;
    unmount(): void;
    registerEffect(effect: SideEffectRef): VNode<A,B>;
    getRaw(): A;
}