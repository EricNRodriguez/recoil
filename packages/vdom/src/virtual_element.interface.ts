import { VNode } from "./virtual_node.interface";
import {IAtom} from "../../atom";
import {BiConsumer, Consumer} from "../../util";

export type ElementStyle = { [key: string]: string };

export type Attribute = string | IAtom<string>;

// A lightweight wrapper around a raw element
export interface VElement<A, B extends VElement<A, B>> extends VNode<A, B> {
  addEventHandler(eventType: string, handler: BiConsumer<Event, A>): B;
  setClickHandler(handler: Consumer<MouseEvent>): B;
  setAttribute(attribute: string, value: Attribute): B;
  setStyle(style: ElementStyle): B;
  getRaw(): A;
}
