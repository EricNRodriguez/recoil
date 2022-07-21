import { HtmlVNode } from "recoil-vdom";

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | HtmlVNode;
