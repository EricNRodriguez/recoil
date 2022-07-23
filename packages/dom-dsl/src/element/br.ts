import { VElement } from "../../../vdom";

export const br = (): VElement<HTMLBRElement> => {
  return new VElement(document.createElement("br"));
};
