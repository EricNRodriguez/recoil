import { wrapTextInVNode } from "../util/dom_util";
import { MaybeNodeOrVNode } from "./node.interface";
import { VElement } from "../../../vdom";

export type DivContent = MaybeNodeOrVNode | string;

export const div = (...children: DivContent[]): VElement => {
  return new VElement("div").setChildren(...children.map(wrapTextInVNode));
};
