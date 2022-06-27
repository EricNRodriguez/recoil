import {ElementBuilderImpl} from "./builder/element_builder";
import {NodeBuilder} from "./builder/node_builder.interface";

export const hr = (): NodeBuilder => {
    return new ElementBuilderImpl("hr");
};