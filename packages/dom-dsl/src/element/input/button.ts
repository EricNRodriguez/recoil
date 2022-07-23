import { HtmlVElement } from "recoil-vdom";
import { Consumer } from "recoil-util";
import {wrapTextInVNode} from "../../util/dom_util";

export type ButtonContent = Text | string;

export type ButtonArgs = {
  content: ButtonContent;
  onClick: Consumer<MouseEvent>;
};

export const button = (args: ButtonArgs): HtmlVElement => {
  return new HtmlVElement("button")
    .setAttribute("type", "button")
    .setChildren(wrapTextInVNode(args.content))
    .setClickHandler(args.onClick);
};
