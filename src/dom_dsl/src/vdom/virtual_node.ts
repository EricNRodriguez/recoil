import {VNode} from "./virtual_node.interface";

export class VNodeImpl implements VNode {
    private readonly node: Node;

    constructor(node: Node) {
        this.node = node;
    }

    public getRaw(): Node {
        return this.node;
    }
}