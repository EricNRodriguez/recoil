import {ElementBuilder} from "./vdom/virtual_element.interface";
import {ElementBuilderImpl} from "./vdom/virtual_element";
import {t, TextContent} from "./text";

export type AnchorContent = TextContent

export const a = (content: AnchorContent): ElementBuilder => {
    return new ElementBuilderImpl("a")
        .withChildren(t(content));
}