import { HtmlVElement } from "recoil-vdom";
import { MaybeNodeOrVNode } from "../node.interface";

export enum FormTarget {
  BLANK = "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrVNode[]): HtmlVElement => {
  return new HtmlVElement("form").setChildren(...content);
};
