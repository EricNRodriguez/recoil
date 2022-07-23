import { t } from "../element/text";
import { HtmlVNode } from "../../../vdom";

export const wrapTextInVNode = <T>(content: T | string): T | HtmlVNode => {
  if (typeof content === "string") {
    return t(content as string);
  } else {
    return content;
  }
};
