import {Consumer} from "../../../atom/src/util.interface";

export interface VNode<T> {
    mount(): void;
    unmount(): void;
    registerEffect(effect: Consumer<T>): VNode<T>;
    getRaw(): T;
}