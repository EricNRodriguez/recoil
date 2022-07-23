import { MaybeNodeOrVNode } from "../node.interface";
import {HtmlVElement} from "../../../../vdom";

export enum FormTarget {
  BLANK = "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrVNode[]): HtmlVElement => {
  return new HtmlVElement("form").setChildren(...content);
};
