import {wrapTextInVNode} from "../util/dom_util";
import { MaybeNodeOrVNode } from "./node.interface";
import {HtmlVElement} from "../../../vdom";

export type DivContent = MaybeNodeOrVNode | string;

export const div = (...children: DivContent[]): HtmlVElement => {
  return new HtmlVElement("div").setChildren(...children.map(wrapTextInVNode));
};
