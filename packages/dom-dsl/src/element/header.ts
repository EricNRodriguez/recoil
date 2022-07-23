import { wrapTextInVNode } from "../util/dom_util";
import { VElement, VNode } from "../../../vdom";

export type HeaderContent = VNode | string;

interface HeaderBuilder {
  (content: HeaderContent): VElement<HTMLHeadingElement>;
}

const buildHeaderDslHelper = (headerNumber: string): HeaderBuilder => {
  return (content: HeaderContent): VElement<HTMLHeadingElement> => {
    return new VElement(document.createElement(`h${headerNumber}`) as HTMLHeadingElement).setChildren(
      wrapTextInVNode(content)
    );
  };
};

export const h1 = buildHeaderDslHelper("1");
export const h2 = buildHeaderDslHelper("2");
export const h3 = buildHeaderDslHelper("3");
export const h4 = buildHeaderDslHelper("4");
export const h5 = buildHeaderDslHelper("5");
export const h6 = buildHeaderDslHelper("6");
