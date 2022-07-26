import { wrapTextInVNode } from "../util/dom_util";
import { MaybeNodeOrVNode } from "./node.interface";
import { VElement } from "../../../dom";

export type DivContent = MaybeNodeOrVNode | string;

export const div = (...children: DivContent[]): VElement<HTMLElement> => {
  return new VElement<HTMLDivElement>(
    document.createElement("div")
  ).setChildren(...children.map(wrapTextInVNode));
};
