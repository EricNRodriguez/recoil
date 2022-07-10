import {VNode} from "./virtual_node.interface";
import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {MaybeNode} from "../node.interface";
import {Supplier} from "../util.interface";
import {Atom} from "../../../atom";
import {VElementImpl} from "./virtual_element";

export type ElementStyle = {[key: string]: string};

export type Attribute = string | Supplier<string> | Atom<string>;

export interface VElement<A extends Element, B extends VElement<A,B>> {
    // addEventHandler(eventType: string, handler: BiConsumer<Event, T>): VElement<T>
    // setClickHandler(handler: Consumer<MouseEvent>): VElement<T>;
    // setAttribute(attribute: string, value: Attribute): VElement<T>;
    // setStyle(style: ElementStyle): VElement<T>;
    // registerEffect(effect: Consumer<T>): VElement<T>;
    setChildren(...children: VNode<any>[]): B;
    getRaw(): A;
}