import {unwrapNodesFromBuilder} from "./vdom/vdom_util";
import {NodeBuilder} from "./vdom/virtual_node.interface";

export const runApp = (anchor: Element, app: Node | NodeBuilder): void => {
    anchor.replaceChildren(unwrapNodesFromBuilder<Node>(app) as Node);
};