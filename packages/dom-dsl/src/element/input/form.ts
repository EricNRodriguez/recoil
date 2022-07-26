import { MaybeNodeOrVNode } from "../node.interface";
import { WElement } from "../../../../dom";

export enum FormTarget {
  BLANK = "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (
  ...content: MaybeNodeOrVNode[]
): WElement<HTMLFormElement> => {
  return new WElement(document.createElement("form")).setChildren(...content);
};
