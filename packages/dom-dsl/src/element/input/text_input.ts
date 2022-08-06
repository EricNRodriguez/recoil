import { createComponent, IComponentContext } from "../../../../dom-component";
import { WElement } from "../../../../dom";
import { ILeafAtom } from "../../../../atom";

export const textInput = createComponent(
  (
    ctx: IComponentContext,
    text: ILeafAtom<string>
  ): WElement<HTMLInputElement> => {
    const element = new WElement(document.createElement("input"))
      .setAttribute("type", "text")
      .bindProperty("value", text);

    return element;
  }
);
