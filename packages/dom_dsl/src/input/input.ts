import {HtmlVElement} from "../vdom/virtual_element";

export const input = (): HtmlVElement => {
    return new HtmlVElement("input");
}