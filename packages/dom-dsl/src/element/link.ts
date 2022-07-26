import { VElement } from "../../../dom";

export const link = (): VElement<HTMLLinkElement> => {
  return new VElement(document.createElement("link"));
};
