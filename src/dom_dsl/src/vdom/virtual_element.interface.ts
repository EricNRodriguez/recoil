import {VNode} from "./virtual_node.interface";
import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {MaybeNode} from "../node.interface";
import {Supplier} from "../util.interface";
import {Atom} from "../../../atom";

export type ElementStyle = {[key: string]: string};

export type Attribute = string | Supplier<string> | Atom<string>;

export interface VElement extends VNode{
    withEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): VElement
    withClickHandler(handler: Consumer<MouseEvent>): VElement;
    withAttribute(attribute: string, value: Attribute): VElement;
    withChildren(...children: (MaybeNode | string)[]): VElement;
    withStyle(style: ElementStyle): VElement;
    getRaw(): Element;
}