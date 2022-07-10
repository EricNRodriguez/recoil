import {VNode} from "./vdom/virtual_node.interface";
import {VElementImpl} from "./vdom/virtual_element";

export const br = (): VNode => {
    return new VElementImpl("br");
};