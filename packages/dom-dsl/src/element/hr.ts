import { VElement } from "../../../vdom";

export const hr = (): VElement<HTMLHRElement> => {
  return new VElement(document.createElement("hr"));
};
