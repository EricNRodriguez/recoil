import {t, TextContent} from "../text";
import {ElementBuilder} from "../vdom/virtual_element.interface";
import {ElementBuilderImpl} from "../vdom/virtual_element";

export type LabelContent = TextContent;

export const label = (content: LabelContent): ElementBuilder => {
    return new ElementBuilderImpl("label")
        .withChildren(t(content));
}