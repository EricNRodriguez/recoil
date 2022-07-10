import {VNode} from "./virtual_node.interface";
import {Supplier} from "../util.interface";
import {MaybeNode, MaybeNodeOrVNode} from "../node.interface";
import {t} from "../text";
import {HtmlVNode} from "./virtual_node";
import {HtmlVElement} from "./virtual_element";
import {notNullOrUndefined} from "../util/dom_utils";

export const isVNode = (content: any): boolean => {
    return content instanceof Object && "getRaw" in content;
}

export const unwrapVNode = (content: Node | VNode<any, any>): Node => {
    if (content === null || content === undefined) {
        return content;
    }

    if (isVNode(content)) {
        return (content as HtmlVNode).getRaw();
    }

    return content as Node;
};

export const unwrapMaybeVNode = (content: Node | VNode<any, any> | null | undefined): MaybeNode => {
      if (!notNullOrUndefined(content)) {
          return content as (null | undefined);
      } else {
          return unwrapVNode(content as (Node | VNode<any, any>));
      }


};

export const unwrapNodesFromProvider = (provider: Supplier<MaybeNodeOrVNode>): Supplier<MaybeNode> => {
    return (): MaybeNode => {
        const value = provider();
        if (isVNode(value)) {
            return (value as HtmlVNode).getRaw();
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

export const wrapRawText = <T extends Node>(content: HtmlVNode | string): HtmlVNode => {
    if (typeof content === "string") {
        return t(content as string);
    } else {
        return content as HtmlVNode;
    }
}
