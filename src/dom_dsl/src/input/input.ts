import {ElementBuilder} from "../builder/element_builder.interface";
import {ElementBuilderImpl} from "../builder/element_builder";

export const input = (): ElementBuilder => {
    return new ElementBuilderImpl("input");
}