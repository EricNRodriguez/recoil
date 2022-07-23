import { wrapTextInVNode } from "../util/dom_util";
import { VElement } from "../../../vdom";

type ParagraphContent = Text | string;

export const p = (children: ParagraphContent): VElement => {
  return new VElement("p").setChildren(wrapTextInVNode(children));
};
