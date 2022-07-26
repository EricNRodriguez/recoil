import { VElement } from "../../../dom";

export const br = (): VElement<HTMLBRElement> => {
  return new VElement(document.createElement("br"));
};
