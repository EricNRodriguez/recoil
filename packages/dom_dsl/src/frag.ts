import {div} from "./div";
import {MaybeNodeOrVNode} from "./node.interface";
import {HtmlVElement} from "./vdom/virtual_element";

export type FragContent = MaybeNodeOrVNode;

export const frag = (...children: FragContent[]): HtmlVElement => {
    return div(...children)
        .setStyle({
            "display": "contents",
        });
}