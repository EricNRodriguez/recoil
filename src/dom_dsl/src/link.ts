import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";

export const link = (): ElementBuilder => {
  return new ElementBuilderImpl("link");
};