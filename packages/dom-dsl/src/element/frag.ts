import { MaybeNodeOrVNode } from "./node.interface";
import { WNode } from "../../../dom";
import { div } from "./div";

export type FragContent = MaybeNodeOrVNode;

export const frag = (...children: FragContent[]): WNode<Node> => {
  return div(...children).setStyle({ display: "contents" });
};
