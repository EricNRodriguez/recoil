import {NodeBuilder} from "./node_builder.interface";
import {Supplier} from "../util.interface";

export const isNodeBuilder = (content: any): boolean => {
    return "build" in content;
}

export const unwrapNodesFromBuilder = <T>(content: T | NodeBuilder | null | undefined): T | Node | null | undefined => {
    if (content === null || content === undefined) {
        return content;
    }

    if (isNodeBuilder(content)) {
        return (content as NodeBuilder).build();
    }

    return content as T;
};

export const unwrapNodesFromProvider = (provider: Supplier<Node | NodeBuilder | null | undefined>): Supplier<Node | null | undefined> => {
    return (): Node | null | undefined => {
        const value = provider();
        if (isNodeBuilder(value)) {
            return (value as NodeBuilder).build();
        } else {
            return value as Node | null | undefined;
        }
    };
};