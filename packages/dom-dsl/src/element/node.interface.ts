import { WNode } from "../../../dom";

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | WNode<Node>;
