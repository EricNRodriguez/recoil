import {MaybeNode, MaybeNodeOrNodeBuilder} from "./node.interface";
import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";
import {unwrapNodesFromBuilder} from "./builder/builder_util";

export type HeadContent = MaybeNodeOrNodeBuilder

export const head = (...content: MaybeNodeOrNodeBuilder[]): ElementBuilder => {
    return new ElementBuilderImpl("head")
        .withChildren(
            ...content.map(unwrapNodesFromBuilder<Node>)
        );
};