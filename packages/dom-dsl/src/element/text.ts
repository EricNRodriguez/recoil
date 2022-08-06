import { Supplier } from "../../../util";
import { IAtom } from "../../../atom";
import { WNode } from "../../../dom";

export type TextContent = string | Supplier<string> | IAtom<string>;

export const t = (content: TextContent): WNode<Node> => {
  const node = new WNode<Node>(document.createTextNode(""));

  if (typeof content === "string") {
    node.setProperty("textContent", content);
  } else {
    node.bindProperty("textContent", content);
  }

  return node;
};
