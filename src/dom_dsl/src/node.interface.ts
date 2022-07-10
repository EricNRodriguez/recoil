import {NodeBuilder} from "./vdom/virtual_node.interface";

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrNodeBuilder = MaybeNode | NodeBuilder;