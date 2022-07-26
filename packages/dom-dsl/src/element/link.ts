import { WElement } from "../../../dom";

export const link = (): WElement<HTMLLinkElement> => {
  return new WElement(document.createElement("link"));
};
