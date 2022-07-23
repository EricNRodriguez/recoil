import { t, TextContent } from "./text";
import {HtmlVElement} from "../../../vdom";

export type AnchorContent = TextContent;

export const a = (content: AnchorContent): HtmlVElement => {
  return new HtmlVElement("a").setChildren(t(content));
};
