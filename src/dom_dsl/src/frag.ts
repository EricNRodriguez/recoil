import {div} from "./div";
import {MaybeNodeOrVNode} from "./node.interface";

export type FragContent = MaybeNodeOrVNode;

export const frag = (...children: FragContent[]): Element => {
    return div(...children)
        .setStyle({
            "display": "contents",
        })
        .getRaw();
}