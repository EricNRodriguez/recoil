import { MaybeNodeOrVNode } from "./node.interface";
import { HtmlVElement } from "../../../vdom";

export type HeadContent = MaybeNodeOrVNode;

export const head = (...content: HeadContent[]): HtmlVElement => {
  return new HtmlVElement("head").setChildren(...content);
};
