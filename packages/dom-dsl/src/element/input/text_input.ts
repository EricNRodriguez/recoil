import { createComponent, runMountedEffect } from "../../../../dom-component";
import { VElement } from "../../../../vdom";
import { ILeafAtom } from "../../../../atom";

export const textInput = createComponent(
  (text: ILeafAtom<string>): VElement => {
    const inputElement = document.createElement("input");

    const element = new VElement(inputElement).setAttribute("type", "text");

    element.addEventHandler("input", () => text.set(inputElement.value));

    runMountedEffect((): void => {
      inputElement.value = text.get();
    });

    return element;
  }
);
