import { t } from "../element/text";
import { VNode } from "../../../dom";

export const wrapTextInVNode = <T>(content: T | string): T | VNode<Node> => {
  if (typeof content === "string") {
    return t(content as string);
  } else {
    return content;
  }
};
