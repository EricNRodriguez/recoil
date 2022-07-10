import {VNode} from "./vdom/virtual_node.interface";
import {HtmlVNode} from "./vdom/virtual_node";

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | HtmlVNode<Node>;