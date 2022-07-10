import {ElementBuilder} from "../vdom/virtual_element.interface";
import {ElementBuilderImpl} from "../vdom/virtual_element";

export const input = (): ElementBuilder => {
    return new ElementBuilderImpl("input");
}