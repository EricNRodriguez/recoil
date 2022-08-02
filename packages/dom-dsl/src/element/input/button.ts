import { WElement } from "../../../../dom";
import { Consumer } from "../../../../util";
import { wrapTextInVNode } from "../../util/dom_util";

export type ButtonContent = Text | string;

export const button = (content: ButtonContent): WElement<HTMLButtonElement> => {
  return new WElement(document.createElement("button"))
    .setAttribute("type", "button")
    .setChildren(wrapTextInVNode(content));
};
