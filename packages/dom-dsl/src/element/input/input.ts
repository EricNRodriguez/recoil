import { WElement } from "../../../../dom";

export const input = (): WElement<HTMLInputElement> => {
  return new WElement(document.createElement("input"));
};
