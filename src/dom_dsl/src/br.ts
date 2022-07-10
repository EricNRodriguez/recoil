import {VNode} from "./vdom/virtual_node.interface";
import {HtmlVElement} from "./vdom/virtual_element";

export const br = (): VNode => {
    return new HtmlVElement("br");
};