import { HtmlVElement } from "../vdom/virtual_element";
import {createScope, LeafAtom, runEffect} from "../../../atom";

export const textInput = createScope((text: LeafAtom<string>): HtmlVElement => {
  const inputElement = document.createElement("input");
  
  const element = new HtmlVElement(inputElement)
    .setAttribute("type", "text");

  element.addEventHandler('input', () => text.set(inputElement.value));

  runEffect({effect: (): void => {
      inputElement.value = text.get();
  }});

  return element;
});
