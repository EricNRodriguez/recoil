import { HtmlVElement } from "../vdom/virtual_element";

type ParagraphContent = Text | string;

export const p = (...children: ParagraphContent[]): HtmlVElement => {
  return new HtmlVElement("p").setChildren(...children);
};
