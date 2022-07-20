import { HtmlVElement } from "../../../../vdom";
import { Consumer } from "../../../../util";

export type ButtonContent = Text | string;

export type ButtonArgs = {
  content: ButtonContent;
  onClick: Consumer<MouseEvent>;
};

export const button = (args: ButtonArgs): HtmlVElement => {
  return new HtmlVElement("button")
    .setAttribute("type", "button")
    .setChildren(args.content)
    .setClickHandler(args.onClick);
};
