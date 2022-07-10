import {unwrapVNode} from "./vdom/vdom_util";
import {VNode} from "./vdom/virtual_node.interface";
import {HtmlVNode} from "./vdom/virtual_node";
import {replaceChildren} from "./util/dom_utils";

export const runApp = (anchor: Element, app: HtmlVNode): void => {
    replaceChildren(
        anchor,
        unwrapVNode(app)
    );
};