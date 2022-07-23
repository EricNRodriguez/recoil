import { MaybeNodeOrVNode } from "../node.interface";
import { VElement } from "../../../../vdom";

export enum FormTarget {
  BLANK = "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: MaybeNodeOrVNode[]): VElement<HTMLFormElement> => {
  return new VElement(document.createElement("form")).setChildren(...content);
};
