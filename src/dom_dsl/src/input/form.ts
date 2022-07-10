import {VElement} from "../vdom/virtual_element.interface";
import {VElementImpl} from "../vdom/virtual_element";
import {MaybeNodeOrNodeBuilder} from "../node.interface";
import {unwrapNodesFromBuilder} from "../vdom/vdom_util";

export enum FormTarget {
  BLANK= "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrNodeBuilder[]): VElement => {
  return new VElementImpl("form")
      .withChildren(...content.map(unwrapNodesFromBuilder<Node>));
};