import { wrapTextInVNode } from "../util/dom_util";
import { VElement } from "../../../dom";

type ParagraphContent = Text | string;

export const p = (
  children: ParagraphContent
): VElement<HTMLParagraphElement> => {
  return new VElement(document.createElement("p")).setChildren(
    wrapTextInVNode(children)
  );
};
