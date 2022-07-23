import { VElement } from "../../../../vdom";

export const input = (): VElement<HTMLInputElement> => {
  return new VElement(document.createElement("input"));
};
