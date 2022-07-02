import {NodeBuilder} from "./builder/node_builder.interface";

export type MaybeNode = Node | undefined | null | string;
export type MaybeNodeOrNodeBuilder = MaybeNode | NodeBuilder;