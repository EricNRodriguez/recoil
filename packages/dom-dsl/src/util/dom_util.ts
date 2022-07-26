import { t } from "../element/text";
import { WNode } from "../../../dom";

export const wrapTextInVNode = <T>(content: T | string): T | WNode<Node> => {
  if (typeof content === "string") {
    return t(content as string);
  } else {
    return content;
  }
};
