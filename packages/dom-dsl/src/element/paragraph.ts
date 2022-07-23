import {wrapTextInVNode} from "../util/dom_util";
import {HtmlVElement} from "../../../vdom";

type ParagraphContent = Text | string;

export const p = (children: ParagraphContent): HtmlVElement => {
  return new HtmlVElement("p").setChildren(wrapTextInVNode(children));
};
