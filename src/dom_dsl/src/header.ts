import {ElementBuilderImpl} from "./builder/element_builder";
import {ElementBuilder} from "./builder/element_builder.interface";

export type HeaderContent = Text;

interface HeaderBuilder {
    (content: HeaderContent): ElementBuilder;
}

const buildHeaderDslHelper = (headerNumber: string): HeaderBuilder => {
    return (content: HeaderContent): ElementBuilder => {
        return new ElementBuilderImpl(`h${headerNumber}`)
            .withChildren(content);
    };
};

export const h1 = buildHeaderDslHelper("1");
export const h2 = buildHeaderDslHelper("2");
export const h3 = buildHeaderDslHelper("3");
export const h4 = buildHeaderDslHelper("4");
export const h5 = buildHeaderDslHelper("5");
export const h6 = buildHeaderDslHelper("6");


