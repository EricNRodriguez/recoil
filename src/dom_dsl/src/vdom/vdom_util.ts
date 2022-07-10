import {VNode} from "./virtual_node.interface";
import {Supplier} from "../util.interface";
import {MaybeNode, MaybeNodeOrVNode} from "../node.interface";

export const isVNode = (content: any): boolean => {
    return content instanceof Object && "build" in content;
}

export const unwrapVNode = <T>(content: T | VNode | null | undefined): T | MaybeNode => {
    if (content === null || content === undefined) {
        return content;
    }

    if (isVNode(content)) {
        return (content as VNode).getRaw();
    }

    return content as T;
};

export const unwrapNodesFromProvider = (provider: Supplier<MaybeNodeOrVNode>): Supplier<MaybeNode> => {
    return (): MaybeNode => {
        const value = provider();
        if (isVNode(value)) {
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