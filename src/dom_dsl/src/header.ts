import {HtmlVElement} from "./vdom/virtual_element";
import {VElement} from "./vdom/virtual_element.interface";

export type HeaderContent = Text | string;

interface HeaderBuilder {
    (content: HeaderContent): VElement;
}

const buildHeaderDslHelper = (headerNumber: string): HeaderBuilder => {
    return (content: HeaderContent): VElement => {
        return new HtmlVElement(`h${headerNumber}`)
            .setChildren(content);
    };
};

export const h1 = buildHeaderDslHelper("1");
export const h2 = buildHeaderDslHelper("2");
export const h3 = buildHeaderDslHelper("3");
export const h4 = buildHeaderDslHelper("4");
export const h5 = buildHeaderDslHelper("5");
export const h6 = buildHeaderDslHelper("6");


