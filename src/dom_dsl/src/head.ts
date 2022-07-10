import {MaybeNode, MaybeNodeOrVNode} from "./node.interface";
import {VElement} from "./vdom/virtual_element.interface";
import {VElementImpl} from "./vdom/virtual_element";
import {unwrapVNode} from "./vdom/vdom_util";

export type HeadContent = MaybeNodeOrVNode

export const head = (...content: MaybeNodeOrVNode[]): VElement => {
    return new VElementImpl("head")
        .withChildren(
            ...content.map(unwrapVNode<Node>)
        );
};