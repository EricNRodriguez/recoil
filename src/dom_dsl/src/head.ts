import {MaybeNode, MaybeNodeOrNodeBuilder} from "./node.interface";
import {ElementBuilder} from "./vdom/virtual_element.interface";
import {ElementBuilderImpl} from "./vdom/virtual_element";
import {unwrapNodesFromBuilder} from "./vdom/vdom_util";

export type HeadContent = MaybeNodeOrNodeBuilder

export const head = (...content: MaybeNodeOrNodeBuilder[]): ElementBuilder => {
    return new ElementBuilderImpl("head")
        .withChildren(
            ...content.map(unwrapNodesFromBuilder<Node>)
        );
};