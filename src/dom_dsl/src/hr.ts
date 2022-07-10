import {ElementBuilderImpl} from "./vdom/virtual_element";
import {NodeBuilder} from "./vdom/virtual_node.interface";

export const hr = (): NodeBuilder => {
    return new ElementBuilderImpl("hr");
};