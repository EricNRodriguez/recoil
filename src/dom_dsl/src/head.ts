import {MaybeNode, MaybeNodeOrNodeBuilder} from "./node.interface";
import {VElement} from "./vdom/virtual_element.interface";
import {VElementImpl} from "./vdom/virtual_element";
import {unwrapNodesFromBuilder} from "./vdom/vdom_util";

export type HeadContent = MaybeNodeOrNodeBuilder

export const head = (...content: MaybeNodeOrNodeBuilder[]): VElement => {
    return new VElementImpl("head")
        .withChildren(
            ...content.map(unwrapNodesFromBuilder<Node>)
        );
};