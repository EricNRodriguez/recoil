import {VElement} from "../vdom/virtual_element.interface";
import {VElementImpl} from "../vdom/virtual_element";

export const input = (): VElement => {
    return new VElementImpl("input");
}