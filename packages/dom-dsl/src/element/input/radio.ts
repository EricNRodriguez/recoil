import { createComponent, IComponentContext } from "../../../../dom-component";
import { VElement } from "../../../../dom";
import { Runnable, Supplier } from "../../../../util";

export type RadioButtonArguments = {
  isChecked: Supplier<boolean>;
  onClick: Runnable;
};

export const radioButton = createComponent(
  (
    ctx: IComponentContext,
    args: RadioButtonArguments
  ): VElement<HTMLInputElement> => {
    const radioButtonElement: VElement<HTMLInputElement> = new VElement(
      document.createElement("input")
    ).setAttribute("type", "radio");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    ctx.runEffect((): void => {
      const isChecked: boolean | null = args.isChecked();
      if (prevCheckedValue === isChecked) {
        return;
      }

      prevCheckedValue = isChecked;
      radioButtonElement.unwrap().checked = isChecked;
    });

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // element is to toggle.
    const originalOnClick = args.onClick;
    radioButtonElement.unwrap().onclick = (): void => {
      originalOnClick();

      radioButtonElement.unwrap().checked = args.isChecked();
    };

    return radioButtonElement;
  }
);
