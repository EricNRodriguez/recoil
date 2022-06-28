import {NodeBuilder} from "./builder/node_builder.interface";
import {div} from "./div";

export type FragContent = Node | Element | NodeBuilder;

export const frag = (...children: FragContent[]): Element => {
    return div(...children)
        .withStyle({
            "display": "contnet",
        })
        .build();
}