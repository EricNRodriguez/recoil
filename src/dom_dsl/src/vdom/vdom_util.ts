import {VNode} from "./virtual_node.interface";
import {Supplier} from "../util.interface";
import {MaybeNode, MaybeNodeOrNodeBuilder} from "../node.interface";

export const isNodeBuilder = (content: any): boolean => {
    return content !== null && content !== undefined && "build" in content;
}

export const unwrapNodesFromBuilder = <T>(content: T | VNode | null | undefined): T | MaybeNode => {
    if (content === null || content === undefined) {
        return content;
    }

    if (isNodeBuilder(content)) {
        return (content as VNode).getRaw();
    }

    return content as T;
};

export const unwrapNodesFromProvider = (provider: Supplier<MaybeNodeOrNodeBuilder>): Supplier<MaybeNode> => {
    return (): MaybeNode => {
        const value = provider();
        if (isNodeBuilder(value)) {
            return (value as VNode).getRaw();
        } else {
            return value as MaybeNode;
        }
    };
};

export const wrapStaticContentInProvider = <T>(content: T | Supplier<T>): Supplier<T> => {
    if (typeof content === "function") {
        return content as Supplier<T>;
    } else {
        return (): T => content;
    }
};