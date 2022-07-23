import { wrapTextInVNode } from "../util/dom_util";
import { VElement } from "../../../vdom";

type ParagraphContent = Text | string;

export const p = (children: ParagraphContent): VElement<HTMLParagraphElement> => {
  return new VElement(document.createElement("p")).setChildren(wrapTextInVNode(children));
};
