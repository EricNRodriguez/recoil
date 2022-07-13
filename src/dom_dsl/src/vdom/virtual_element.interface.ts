import {VNode} from "./virtual_node.interface";
import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {MaybeNode} from "../node.interface";
import {Supplier} from "../util.interface";
import {Atom} from "../../../atom";
import {HtmlVElement} from "./virtual_element";

export type ElementStyle = {[key: string]: string};

export type Attribute = string | Supplier<string> | Atom<string>;

// A lightweight wrapper around a raw element
export interface VElement<A, B extends VElement<A,B>> extends VNode<A, B>{
    addEventHandler(eventType: string, handler: BiConsumer<Event, A>): B
    setClickHandler(handler: Consumer<MouseEvent>): B;
    setAttribute(attribute: string, value: Attribute): B;
    setStyle(style: ElementStyle): B;
    setChildren(...children: (VNode<any, VNode<any, any>> | string)[]): B;
    deleteChildren(offset: number): B;
    appendChildren(children: (VNode<any, any> | Node | string | null | undefined)[]): B;
    getRaw(): A;
}