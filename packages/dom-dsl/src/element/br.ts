import { WElement } from "../../../dom";

export const br = (): WElement<HTMLBRElement> => {
  return new WElement(document.createElement("br"));
};
