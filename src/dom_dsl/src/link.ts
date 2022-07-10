import {VElement} from "./vdom/virtual_element.interface";
import {VElementImpl} from "./vdom/virtual_element";

export const link = (): VElement => {
  return new VElementImpl("link");
};