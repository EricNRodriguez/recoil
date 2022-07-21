import { HtmlVElement } from "recoil-vdom";
import { t, TextContent } from "./text";

export type AnchorContent = TextContent;

export const a = (content: AnchorContent): HtmlVElement => {
  return new HtmlVElement("a").setChildren(t(content));
};
