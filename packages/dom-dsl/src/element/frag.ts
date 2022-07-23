import { MaybeNodeOrVNode } from "./node.interface";
import {HtmlVNode} from "../../../vdom";

export type FragContent = MaybeNodeOrVNode;

export const frag = (...children: FragContent[]): HtmlVNode => {
  const rawElem = document.createDocumentFragment();
  return new HtmlVNode(rawElem)
    .setChildren(...children);
};
