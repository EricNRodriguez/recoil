import {HtmlVElement} from "./vdom/virtual_element";
import {VElement} from "./vdom/virtual_element.interface";
import {wrapRawText} from "./vdom/vdom_util";

export type HeaderContent = Text | string;

interface HeaderBuilder {
    (content: HeaderContent): HtmlVElement;
}

const buildHeaderDslHelper = (headerNumber: string): HeaderBuilder => {
    return (content: HeaderContent): HtmlVElement => {
        return new HtmlVElement(`h${headerNumber}`)
            .setChildren(
                wrapRawText(content),
            );
    };
};

export const h1 = buildHeaderDslHelper("1");
export const h2 = buildHeaderDslHelper("2");
export const h3 = buildHeaderDslHelper("3");
export const h4 = buildHeaderDslHelper("4");
export const h5 = buildHeaderDslHelper("5");
export const h6 = buildHeaderDslHelper("6");


