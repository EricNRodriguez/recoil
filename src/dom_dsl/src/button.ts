import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";

export type ButtonContent = Text | string;

export const button = (content: ButtonContent): ElementBuilder => {
    return new ElementBuilderImpl("button")
        .withAttribute("type", "button")
        .withChildren(content);
};