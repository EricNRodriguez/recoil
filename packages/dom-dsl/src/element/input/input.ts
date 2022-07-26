import { VElement } from "../../../../dom";

export const input = (): VElement<HTMLInputElement> => {
  return new VElement(document.createElement("input"));
};
