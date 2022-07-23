import { MaybeNodeOrVNode } from "./node.interface";
import { VNode } from "../../../vdom";

export type FragContent = MaybeNodeOrVNode;

export const frag = (...children: FragContent[]): VNode => {
  const rawElem = document.createDocumentFragment();
  return new VNode(rawElem).setChildren(...children);
};
