import {HtmlVElement} from "./vdom/virtual_element";
import {t, TextContent} from "./text";

export type AnchorContent = TextContent

export const a = (content: AnchorContent): HtmlVElement => {
    return new HtmlVElement("a")
        .setChildren(t(content));
}