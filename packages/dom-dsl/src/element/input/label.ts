import { t, TextContent } from "../text";
import { VElement } from "../../../../vdom";

export type LabelContent = TextContent;

export const label = (content: LabelContent): VElement<HTMLLabelElement> => {
  return new VElement(document.createElement("label")).setChildren(t(content));
};
