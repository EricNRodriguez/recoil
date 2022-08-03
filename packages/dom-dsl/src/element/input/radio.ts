import { createComponent, IComponentContext } from "../../../../dom-component";
import { WElement } from "../../../../dom";
import { Runnable, Supplier } from "../../../../util";
import { IAtom } from "../../../../atom";

export type RadioButtonArguments = {
  isChecked: IAtom<boolean>;
};

export const radioButton = createComponent(
  (
    ctx: IComponentContext,
    args: RadioButtonArguments
  ): WElement<HTMLInputElement> => {
    const radioButtonElement: WElement<HTMLInputElement> = new WElement(
      document.createElement("input")
    ).setAttribute("type", "radio");

    // binding effect for checked attribute
    ctx.runEffect((): void => {
      const isChecked = args.isChecked.get();

      // changes triggered inside an event handler will be reverted
      // if preventDefault is called
      setTimeout(() => {
        radioButtonElement.unwrap().checked = isChecked;
      }, 0);
    });

    // State changes should be reactive
    radioButtonElement.unwrap().onclick = (e: Event) => e.preventDefault();

    return radioButtonElement;
  }
);
