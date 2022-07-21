import { HtmlVElement } from "recoil-vdom";
import { MaybeNodeOrVNode } from "./node.interface";

export type DivContent = MaybeNodeOrVNode | string;

export const div = (...children: DivContent[]): HtmlVElement => {
  return new HtmlVElement("div").setChildren(...children);
};
