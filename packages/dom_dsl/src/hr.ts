import { HtmlVElement } from "./vdom/virtual_element";

export const hr = (): HtmlVElement => {
  return new HtmlVElement("hr");
};
