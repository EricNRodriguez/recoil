import {isVNode, VNodeBase} from "./virtual_node_base";
import {VNode} from "./virtual_node.interface";
import {nullOrUndefined} from "../../util";

export class HtmlVNode extends VNodeBase<Node, HtmlVNode> {
  constructor(node: Node) {
    super(node);
  }
}
export const wrapInVNode = (
  node: VNode<any, any> | Node | string | null | undefined
): VNode<any, any> | null | undefined => {
  if (nullOrUndefined(node)) {
    return node as null | undefined;
  }

  if (isVNode(node)) {
    return node as VNode<any, any>;
  } else {
    return new HtmlVNode(node as Node);
  }
};

