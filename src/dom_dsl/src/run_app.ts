import {unwrapNodesFromBuilder} from "./vdom/vdom_util";
import {VNode} from "./vdom/virtual_node.interface";

export const runApp = (anchor: Element, app: Node | VNode): void => {
    anchor.replaceChildren(unwrapNodesFromBuilder<Node>(app) as Node);
};