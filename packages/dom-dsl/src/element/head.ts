import { MaybeNodeOrVNode } from "./node.interface";
import { VElement } from "../../../dom";

export type HeadContent = MaybeNodeOrVNode;

export const head = (...content: HeadContent[]): VElement<HTMLHeadElement> => {
  return new VElement(document.createElement("head")).setChildren(...content);
};
