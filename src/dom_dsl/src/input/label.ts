import {t, TextContent} from "../text";
import {ElementBuilder} from "../builder/element_builder.interface";
import {ElementBuilderImpl} from "../builder/element_builder";

export type LabelContent = TextContent;

export const label = (content: LabelContent): ElementBuilder => {
    return new ElementBuilderImpl("label")
        .withChildren(t(content));
}