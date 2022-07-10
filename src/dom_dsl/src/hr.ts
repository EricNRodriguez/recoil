import {HtmlVElement} from "./vdom/virtual_element";
import {VNode} from "./vdom/virtual_node.interface";

export const hr = (): VNode => {
    return new HtmlVElement("hr");
};