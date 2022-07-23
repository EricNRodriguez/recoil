import { t, TextContent } from "../text";
import { VElement } from "../../../../vdom";

export type LabelContent = TextContent;

export const label = (content: LabelContent): VElement => {
  return new VElement("label").setChildren(t(content));
};
