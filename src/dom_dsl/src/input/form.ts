import {ElementBuilder} from "../vdom/virtual_element.interface";
import {ElementBuilderImpl} from "../vdom/virtual_element";
import {MaybeNodeOrNodeBuilder} from "../node.interface";
import {unwrapNodesFromBuilder} from "../vdom/vdom_util";

export enum FormTarget {
  BLANK= "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrNodeBuilder[]): ElementBuilder => {
  return new ElementBuilderImpl("form")
      .withChildren(...content.map(unwrapNodesFromBuilder<Node>));
};