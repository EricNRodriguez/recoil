import {NodeBuilder} from "./builder/node_builder.interface";
import {unwrapNodesFromBuilder} from "./builder/builder_util";
import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";

export type DivContent = Node | Element | NodeBuilder;

export const div = (...children: DivContent[]): ElementBuilder => {
    return new ElementBuilderImpl("div")
        .withChildren(
            ...children.map(unwrapNodesFromBuilder<Node>)
        );
};