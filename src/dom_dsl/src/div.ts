import {unwrapNodesFromBuilder} from "./builder/builder_util";
import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";
import {MaybeNodeOrNodeBuilder} from "./node.interface";

export type DivContent = MaybeNodeOrNodeBuilder | string;

export const div = (...children: DivContent[]): ElementBuilder => {
    return new ElementBuilderImpl("div")
        .withChildren(
            ...children.map(unwrapNodesFromBuilder<Node | string>)
        );
};