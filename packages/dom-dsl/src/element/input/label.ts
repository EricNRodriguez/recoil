import { t, TextContent } from "../text";
import { WElement } from "../../../../dom";

export type LabelContent = TextContent;

export const label = (content: LabelContent): WElement<HTMLLabelElement> => {
  return new WElement(document.createElement("label"))
    .setChildren(t(content));
};
