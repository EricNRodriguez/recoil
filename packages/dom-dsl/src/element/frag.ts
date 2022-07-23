import { MaybeNodeOrVNode } from "./node.interface";
import { VNode } from "../../../vdom";
import {div} from "./div";

export type FragContent = MaybeNodeOrVNode;

export const frag = (...children: FragContent[]): VNode => {
  return div(...children).setStyle({"display": "content"});
};
