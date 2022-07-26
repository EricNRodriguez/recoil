import { wrapTextInVNode } from "../util/dom_util";
import { WElement, WNode } from "../../../dom";

export type HeaderContent = WNode<Node> | string;

interface HeaderBuilder {
  (content: HeaderContent): WElement<HTMLHeadingElement>;
}

const buildHeaderDslHelper = (headerNumber: string): HeaderBuilder => {
  return (content: HeaderContent): WElement<HTMLHeadingElement> => {
    return new WElement(
      document.createElement(`h${headerNumber}`) as HTMLHeadingElement
    ).setChildren(wrapTextInVNode(content));
  };
};

export const h1 = buildHeaderDslHelper("1");
export const h2 = buildHeaderDslHelper("2");
export const h3 = buildHeaderDslHelper("3");
export const h4 = buildHeaderDslHelper("4");
export const h5 = buildHeaderDslHelper("5");
export const h6 = buildHeaderDslHelper("6");
