import { BaseWNode, WNode } from "./node";
import { Method } from "../../utils/src/function.interface";
import { GlobalEventCoordinator } from "./event";
export declare type ElementStyle = {
    [key: string]: string;
};
export declare abstract class BaseWElement<A extends HTMLElement, B extends BaseWElement<A, B>> extends BaseWNode<A, B> {
    private readonly eventCoordinator;
    constructor(element: A, eventCoordinator: GlobalEventCoordinator);
    setAttribute(attribute: string, value: string): B;
    setEventHandler<K extends keyof HTMLElementEventMap>(type: K, listener: Method<HTMLElement, HTMLElementEventMap[K], void>, delegate?: boolean): B;
}
export declare class WElement<T extends HTMLElement> extends BaseWElement<T, WElement<T>> implements WNode<T> {
    constructor(elem: T, eventCoordinator: GlobalEventCoordinator);
}
//# sourceMappingURL=element.d.ts.map