import {VElement} from "../vdom/virtual_element.interface";
import {HtmlVElement} from "../vdom/virtual_element";
import {Consumer} from "../../../atom/src/util.interface";

export type ButtonContent = Text | string;

export type ButtonArgs = {
    content: ButtonContent,
    onClick: Consumer<MouseEvent>,
};

export const button = (args: ButtonArgs): HtmlVElement => {
    return new HtmlVElement("button")
        .setAttribute("type", "button")
        .setChildren(args.content)
        .setClickHandler(args.onClick);
};