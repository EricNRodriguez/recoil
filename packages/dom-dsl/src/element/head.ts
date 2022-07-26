import { MaybeNodeOrVNode } from "./node.interface";
import { WElement } from "../../../dom";

export type HeadContent = MaybeNodeOrVNode;

export const head = (...content: HeadContent[]): WElement<HTMLHeadElement> => {
  return new WElement(document.createElement("head")).setChildren(...content);
};
