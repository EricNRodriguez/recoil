import { WElement } from "../../../../dom";
import { Consumer } from "../../../../util";
import { wrapTextInVNode } from "../../util/dom_util";

export type ButtonContent = Text | string;

export type ButtonArgs = {
  content: ButtonContent;
  onClick: Consumer<MouseEvent>;
};

export const button = (args: ButtonArgs): WElement<HTMLButtonElement> => {
  return new WElement(document.createElement("button"))
    .setAttribute("type", "button")
    .setChildren(wrapTextInVNode(args.content))
    .setClickHandler(args.onClick);
};
