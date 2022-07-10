import {NodeBuilder} from "./vdom/virtual_node.interface";
import {ElementBuilderImpl} from "./vdom/virtual_element";

export const br = (): NodeBuilder => {
    return new ElementBuilderImpl("br");
};