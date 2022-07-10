import {VElement} from "./vdom/virtual_element.interface";
import {VElementImpl} from "./vdom/virtual_element";
import {t, TextContent} from "./text";

export type AnchorContent = TextContent

export const a = (content: AnchorContent): VElement => {
    return new VElementImpl("a")
        .withChildren(t(content));
}