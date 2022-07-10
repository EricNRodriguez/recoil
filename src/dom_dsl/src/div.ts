import {unwrapVNode} from "./vdom/vdom_util";
import {VElement} from "./vdom/virtual_element.interface";
import {HtmlVElement} from "./vdom/virtual_element";
import {MaybeNodeOrVNode} from "./node.interface";

export type DivContent = MaybeNodeOrVNode | string;

export const div = (...children: DivContent[]): HtmlVElement => {
    return new HtmlVElement("div")
        .setChildren(
            ...children
        );
};