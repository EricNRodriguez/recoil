import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";
import {t, TextContent} from "./text";

export type AnchorContent = TextContent

export const a = (content: AnchorContent): ElementBuilder => {
    return new ElementBuilderImpl("a")
        .withChildren(t(content));
}