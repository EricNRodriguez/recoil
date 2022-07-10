import {VElement} from "../vdom/virtual_element.interface";
import {VElementImpl} from "../vdom/virtual_element";
import {MaybeNodeOrVNode} from "../node.interface";
import {unwrapVNode} from "../vdom/vdom_util";

export enum FormTarget {
  BLANK= "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrVNode[]): VElement => {
  return new VElementImpl("form")
      .setChildren(...content.map(unwrapVNode<Node>));
};