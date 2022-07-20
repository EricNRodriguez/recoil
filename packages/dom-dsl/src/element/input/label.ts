import { t, TextContent } from "../text";
import { HtmlVElement } from "../../../../vdom";

export type LabelContent = TextContent;

export const label = (content: LabelContent): HtmlVElement => {
  return new HtmlVElement("label").setChildren(t(content));
};