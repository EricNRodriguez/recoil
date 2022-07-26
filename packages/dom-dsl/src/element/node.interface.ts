import { VNode } from "../../../dom";

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | VNode<Node>;
