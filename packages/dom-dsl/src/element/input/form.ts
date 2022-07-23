import { MaybeNodeOrVNode } from "../node.interface";
import { VElement } from "../../../../vdom";

export enum FormTarget {
  BLANK = "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrVNode[]): VElement => {
  return new VElement("form").setChildren(...content);
};
