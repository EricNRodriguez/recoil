import { WElement } from "../../../dom";

export const hr = (): WElement<HTMLHRElement> => {
  return new WElement(document.createElement("hr"));
};
