import {unwrapNodesFromBuilder} from "./vdom/vdom_util";
import {VElement} from "./vdom/virtual_element.interface";
import {VElementImpl} from "./vdom/virtual_element";
import {MaybeNodeOrNodeBuilder} from "./node.interface";

export type DivContent = MaybeNodeOrNodeBuilder | string;

export const div = (...children: DivContent[]): VElement => {
    return new VElementImpl("div")
        .withChildren(
            ...children.map(unwrapNodesFromBuilder<Node | string>)
        );
};