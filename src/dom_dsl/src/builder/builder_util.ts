import {NodeBuilder} from "./node_builder.interface";
import {Supplier} from "../util.interface";
import {MaybeNode, MaybeNodeOrNodeBuilder} from "../node.interface";

export const isNodeBuilder = (content: any): boolean => {
    return content !== null && content !== undefined && "build" in content;
}

export const unwrapNodesFromBuilder = <T>(content: T | NodeBuilder | null | undefined): T | MaybeNode => {
    if (content === null || content === undefined) {
        return content;
    }

    if (isNodeBuilder(content)) {
        return (content as NodeBuilder).build();
    }

    return content as T;
};

export const unwrapNodesFromProvider = (provider: Supplier<MaybeNodeOrNodeBuilder>): Supplier<MaybeNode> => {
    return (): MaybeNode => {
        const value = provider();
        if (isNodeBuilder(value)) {
            return (value as NodeBuilder).build();
        } else {
            return value as MaybeNode;
        }
    };
};