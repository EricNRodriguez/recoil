import { t, TextContent } from "./text";
import { VElement } from "../../../vdom";

export type AnchorContent = TextContent;

export const a = (content: AnchorContent): VElement => {
  return new VElement("a").setChildren(t(content));
};
