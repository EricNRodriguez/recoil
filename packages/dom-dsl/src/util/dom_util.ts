import {HtmlVNode} from "recoil-vdom/src/virtual_node";
import {t} from "../element/text";

export const wrapTextInVNode = <T>(content: T | string): T | HtmlVNode => {
  if (typeof content === "string") {
    return t(content as string);
  } else {
    return content;
  }
};
