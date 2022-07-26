import { VElement } from "../../../dom";

export const hr = (): VElement<HTMLHRElement> => {
  return new VElement(document.createElement("hr"));
};
