import { WNode } from "./node";
import { createTextNode } from "./api";

export const wrapTextInWNode = <T>(content: T | string): T | WNode<Node> => {
  if (typeof content === "string") {
    return createTextNode(content as string);
  } else {
    return content;
  }
};
