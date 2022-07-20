import { HtmlVElement } from "../../../../vdom";
import { LeafAtom } from "../../../../atom";
import { createComponent } from "../../../../dom-component";
import { runMountedEffect } from "../../../../dom-component";

export const textInput = createComponent(
  (text: LeafAtom<string>): HtmlVElement => {
    const inputElement = document.createElement("input");

    const element = new HtmlVElement(inputElement).setAttribute("type", "text");

    element.addEventHandler("input", () => text.set(inputElement.value));

    runMountedEffect((): void => {
      inputElement.value = text.get();
    });

    return element;
  }
);
