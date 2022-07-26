import { wrapTextInVNode } from "../util/dom_util";
import { WElement } from "../../../dom";

type ParagraphContent = Text | string;

export const p = (
  children: ParagraphContent
): WElement<HTMLParagraphElement> => {
  return new WElement(document.createElement("p")).setChildren(
    wrapTextInVNode(children)
  );
};
