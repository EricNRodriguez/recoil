import { createComponent, IComponentContext } from "../../../../dom-component";
import { VElement } from "../../../../vdom";
import { ILeafAtom } from "../../../../atom";

export const textInput = createComponent(
  (
    ctx: IComponentContext,
    text: ILeafAtom<string>
  ): VElement<HTMLInputElement> => {
    const element = new VElement(document.createElement("input")).setAttribute(
      "type",
      "text"
    );

    element.addEventHandler("input", () => text.set(element.getRaw().value));

    ctx.runEffect((): void => {
      element.getRaw().value = text.get();
    });

    return element;
  }
);
