import { HtmlVElement } from "recoil-vdom";
import {wrapTextInVNode} from "../util/dom_util";

type ParagraphContent = Text | string;

export const p = (children: ParagraphContent): HtmlVElement => {
  return new HtmlVElement("p").setChildren(wrapTextInVNode(children));
};
