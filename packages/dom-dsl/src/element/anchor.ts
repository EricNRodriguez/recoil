import { t, TextContent } from "./text";
import { WElement } from "../../../dom";

export type AnchorContent = TextContent;

export const a = (content: AnchorContent): WElement<HTMLAnchorElement> => {
  return new WElement(document.createElement("a")).setChildren(t(content));
};
