import { VNode } from "./virtual_node.interface";
import { BiConsumer, Consumer } from "recoil-util";
import { Atom } from "recoil-atom";

export type ElementStyle = { [key: string]: string };

export type Attribute = string | Atom<string>;

// A lightweight wrapper around a raw element
export interface VElement<A, B extends VElement<A, B>> extends VNode<A, B> {
  addEventHandler(eventType: string, handler: BiConsumer<Event, A>): B;
  setClickHandler(handler: Consumer<MouseEvent>): B;
  setAttribute(attribute: string, value: Attribute): B;
  setStyle(style: ElementStyle): B;
  setChildren(...children: (VNode<any, VNode<any, any>>)[]): B;
  deleteChildren(offset: number): B;
  appendChildren(
    children: (VNode<any, any> | Node | null | undefined)[]
  ): B;
  getRaw(): A;
}
