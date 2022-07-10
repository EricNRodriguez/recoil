import {ElementBuilder} from "./vdom/virtual_element.interface";
import {ElementBuilderImpl} from "./vdom/virtual_element";

export const link = (): ElementBuilder => {
  return new ElementBuilderImpl("link");
};