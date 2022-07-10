import {VNodeBase} from "./virtual_node_base";

export class HtmlVNode extends VNodeBase<Node, HtmlVNode> {
    constructor(node: Node) {
        super(node);
    }
}