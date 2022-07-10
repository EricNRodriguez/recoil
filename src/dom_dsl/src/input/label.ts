import {t, TextContent} from "../text";
import {VElement} from "../vdom/virtual_element.interface";
import {VElementImpl} from "../vdom/virtual_element";

export type LabelContent = TextContent;

export const label = (content: LabelContent): VElement => {
    return new VElementImpl("label")
        .withChildren(t(content));
}