import {MaybeNode, MaybeNodeOrVNode} from "./node.interface";
import {VElement} from "./vdom/virtual_element.interface";
import {HtmlVElement} from "./vdom/virtual_element";
import {unwrapVNode} from "./vdom/vdom_util";

export type HeadContent = MaybeNodeOrVNode

export const head = (...content: MaybeNodeOrVNode[]): HtmlVElement => {
    return new HtmlVElement("head")
        .setChildren(
            ...content,
        );
};