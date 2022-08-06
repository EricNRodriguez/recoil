import { createComponent, IComponentContext } from "../../../../dom-component";
import { WElement } from "../../../../dom";
import { Runnable, Supplier } from "../../../../util";
import {deriveState, IAtom} from "../../../../atom";

export type RadioButtonArguments = {
  isChecked: IAtom<boolean>;
};

export const radioButton = createComponent(
  (
    ctx: IComponentContext,
    args: RadioButtonArguments
  ): WElement<HTMLInputElement> => {
    const radioButtonElement: WElement<HTMLInputElement> = new WElement(document.createElement("input"))
      .setAttribute("type", "radio")
      .bindProperty("checked", () => args.isChecked.get());

    return radioButtonElement;
  }
);
