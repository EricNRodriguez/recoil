import { HtmlVElement } from "./vdom/virtual_element";

export const link = (): HtmlVElement => {
  return new HtmlVElement("link");
};
