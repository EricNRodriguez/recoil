import { MaybeNodeOrVNode } from "./node.interface";
import { HtmlVElement } from "./vdom/virtual_element";

export type HeadContent = MaybeNodeOrVNode;

export const head = (...content: HeadContent[]): HtmlVElement => {
  return new HtmlVElement("head").setChildren(...content);
};
