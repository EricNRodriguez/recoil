import {HtmlVElement} from "./vdom/virtual_element";
import {VElement} from "./vdom/virtual_element.interface";
import {wrapRawText} from "./vdom/vdom_util";

type ParagraphContent = Text | string;

export const p = (...children: ParagraphContent[]): HtmlVElement => {
    return new HtmlVElement("p")
        .setChildren(
            ...children.map(wrapRawText<Text>)
        );
};