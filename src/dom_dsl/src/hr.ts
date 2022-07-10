import {HtmlVElement} from "./vdom/virtual_element";
import {VNode} from "./vdom/virtual_node.interface";
import {HtmlVNode} from "./vdom/virtual_node";

export const hr = (): HtmlVElement => {
    return new HtmlVElement("hr");
};