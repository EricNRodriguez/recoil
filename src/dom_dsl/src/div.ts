import {unwrapVNode} from "./vdom/vdom_util";
import {VElement} from "./vdom/virtual_element.interface";
import {VElementImpl} from "./vdom/virtual_element";
import {MaybeNodeOrVNode} from "./node.interface";

export type DivContent = MaybeNodeOrVNode | string;

export const div = (...children: DivContent[]): VElement => {
    return new VElementImpl("div")
        .withChildren(
            ...children.map(unwrapVNode<Node | string>)
        );
};