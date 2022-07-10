import {t, TextContent} from "../text";
import {VElement} from "../vdom/virtual_element.interface";
import {HtmlVElement} from "../vdom/virtual_element";

export type LabelContent = TextContent;

export const label = (content: LabelContent): VElement => {
    return new HtmlVElement("label")
        .setChildren(t(content));
}