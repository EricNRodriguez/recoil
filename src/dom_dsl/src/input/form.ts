import {VElement} from "../vdom/virtual_element.interface";
import {HtmlVElement} from "../vdom/virtual_element";
import {MaybeNodeOrVNode} from "../node.interface";
import {unwrapVNode} from "../vdom/vdom_util";

export enum FormTarget {
  BLANK= "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrVNode[]): HtmlVElement => {
  return new HtmlVElement("form")
      .setChildren(
        ...content
      );
};