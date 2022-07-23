import { VElement } from "../../../vdom";

export const link = (): VElement<HTMLLinkElement> => {
  return new VElement(document.createElement("link"));
};
