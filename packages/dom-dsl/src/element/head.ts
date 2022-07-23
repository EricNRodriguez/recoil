import { MaybeNodeOrVNode } from "./node.interface";
import { VElement } from "../../../vdom";

export type HeadContent = MaybeNodeOrVNode;

export const head = (...content: HeadContent[]): VElement => {
  return new VElement("head").setChildren(...content);
};
