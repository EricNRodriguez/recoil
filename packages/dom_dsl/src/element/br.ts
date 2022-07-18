import { HtmlVElement } from "../vdom/virtual_element";

export const br = (): HtmlVElement => {
  return new HtmlVElement("br");
};
