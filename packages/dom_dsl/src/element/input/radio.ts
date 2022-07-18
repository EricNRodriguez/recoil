import { HtmlVElement } from "../../vdom/virtual_element";
import { Runnable, Supplier } from "../../../../util/src/function.interface";
import { createComponent } from "../../component/create_component";
import { runEffect } from "../../../../atom";

export type RadioButtonArguments = {
  isChecked: Supplier<boolean>;
  onClick: Runnable;
};

export const radioButton = createComponent(
  (args: RadioButtonArguments): HtmlVElement => {
    const radioButtonElement: HtmlVElement = new HtmlVElement(
      "input"
    ).setAttribute("type", "radio");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    runEffect((): void => {
      const isChecked: boolean | null = args.isChecked();
      if (prevCheckedValue === isChecked) {
        return;
      }

      prevCheckedValue = isChecked;
      (radioButtonElement.getRaw() as HTMLInputElement).checked = isChecked;
    });

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // element is to toggle.
    const originalOnClick = args.onClick;
    (radioButtonElement.getRaw() as HTMLInputElement).onclick = (): void => {
      originalOnClick();

      (radioButtonElement.getRaw() as HTMLInputElement).checked =
        args.isChecked();
    };

    return radioButtonElement;
  }
);
