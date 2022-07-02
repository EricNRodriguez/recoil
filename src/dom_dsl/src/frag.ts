import {div} from "./div";
import {MaybeNodeOrNodeBuilder} from "./node.interface";

export type FragContent = MaybeNodeOrNodeBuilder;

export const frag = (...children: FragContent[]): Element => {
    return div(...children)
        .withStyle({
            "display": "contents",
        })
        .build();
}