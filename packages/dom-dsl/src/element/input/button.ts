import { VElement } from "../../../../vdom";
import { Consumer } from "../../../../util";
import { wrapTextInVNode } from "../../util/dom_util";

export type ButtonContent = Text | string;

export type ButtonArgs = {
  content: ButtonContent;
  onClick: Consumer<MouseEvent>;
};

export const button = (args: ButtonArgs): VElement => {
  return new VElement("button")
    .setAttribute("type", "button")
    .setChildren(wrapTextInVNode(args.content))
    .setClickHandler(args.onClick);
};
