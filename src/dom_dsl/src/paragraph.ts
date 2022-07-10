import {HtmlVElement} from "./vdom/virtual_element";
import {VElement} from "./vdom/virtual_element.interface";

type ParagraphContent = Text | string;

export const p = (...children: ParagraphContent[]): VElement => {
    return new HtmlVElement("p")
        .setChildren(...children);
};