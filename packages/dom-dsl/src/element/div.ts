import { wrapTextInVNode } from "../util/dom_util";
import { MaybeNodeOrVNode } from "./node.interface";
import { WElement } from "../../../dom";

export type DivContent = MaybeNodeOrVNode | string;

export const div = (...children: DivContent[]): WElement<HTMLElement> => {
  return new WElement<HTMLDivElement>(
    document.createElement("div")
  ).setChildren(...children.map(wrapTextInVNode));
};
