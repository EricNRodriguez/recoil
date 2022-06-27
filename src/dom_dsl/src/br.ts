import {NodeBuilder} from "./builder/node_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";

export const br = (): NodeBuilder => {
    return new ElementBuilderImpl("br");
};