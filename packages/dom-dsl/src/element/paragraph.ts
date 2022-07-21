import { HtmlVElement } from "recoil-vdom";

type ParagraphContent = Text | string;

export const p = (children: ParagraphContent): HtmlVElement => {
  return new HtmlVElement("p").setChildren(children);
};
