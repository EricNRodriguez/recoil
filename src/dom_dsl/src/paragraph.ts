import {ElementBuilderImpl} from "./vdom/virtual_element";
import {ElementBuilder} from "./vdom/virtual_element.interface";

type ParagraphContent = Text | string;

export const p = (...children: ParagraphContent[]): ElementBuilder => {
    return new ElementBuilderImpl("p")
        .withChildren(...children);
};