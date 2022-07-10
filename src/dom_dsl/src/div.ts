import {unwrapNodesFromBuilder} from "./vdom/vdom_util";
import {ElementBuilder} from "./vdom/virtual_element.interface";
import {ElementBuilderImpl} from "./vdom/virtual_element";
import {MaybeNodeOrNodeBuilder} from "./node.interface";

export type DivContent = MaybeNodeOrNodeBuilder | string;

export const div = (...children: DivContent[]): ElementBuilder => {
    return new ElementBuilderImpl("div")
        .withChildren(
            ...children.map(unwrapNodesFromBuilder<Node | string>)
        );
};