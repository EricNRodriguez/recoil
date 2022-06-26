import {ElementBuilderImpl} from "./builder/element_builder";
import {ElementBuilder} from "./builder/element_builder.interface";

type ParagraphContent = Text;

export const p = (...children: ParagraphContent[]): ElementBuilder => {
    return new ElementBuilderImpl("p")
        .withChildren(...children);
};