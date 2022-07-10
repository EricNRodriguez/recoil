import {VNode} from "./virtual_node.interface";
import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {MaybeNode} from "../node.interface";
import {Supplier} from "../util.interface";
import {Atom} from "../../../atom";

export type ElementStyle = {[key: string]: string};

export type Attribute = string | Supplier<string> | Atom<string>;

export interface VElement extends VNode{
    addEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): VElement
    setClickHandler(handler: Consumer<MouseEvent>): VElement;
    setAttribute(attribute: string, value: Attribute): VElement;
    setChildren(...children: VNode[]): VElement;
    setStyle(style: ElementStyle): VElement;
    registerEffect(effect: Consumer<VElement>): VElement;
    getRaw(): Element;
}