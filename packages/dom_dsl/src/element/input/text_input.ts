import { HtmlVElement } from "../../vdom/virtual_element";
import { LeafAtom, runEffect } from "../../../../atom";
import {createComponent, runMountedEffect} from "../../component/create_component";

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
