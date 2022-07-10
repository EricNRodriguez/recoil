import {VElement} from "../vdom/virtual_element.interface";
import {HtmlVElement} from "../vdom/virtual_element";

export const input = (): VElement => {
    return new HtmlVElement("input");
}