import { t, TextContent } from "./text";
import { VElement } from "../../../vdom";

export type AnchorContent = TextContent;

export const a = (content: AnchorContent): VElement<HTMLAnchorElement> => {
  return new VElement(document.createElement("a")).setChildren(t(content));
};
