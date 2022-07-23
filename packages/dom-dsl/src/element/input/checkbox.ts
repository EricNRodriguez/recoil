import { createComponent, runMountedEffect } from "../../../../dom-component";
import { VElement } from "../../../../vdom";
import { Runnable, Supplier } from "../../../../util";

export type CheckboxArguments = {
  isChecked: Supplier<boolean | null>;
  isEnabled?: Supplier<boolean>;
  onClick: Runnable;
};

export const checkbox = createComponent(
  (args: CheckboxArguments): VElement<HTMLInputElement> => {
    const checkboxElement: VElement<HTMLInputElement> = new VElement(
      document.createElement("input")
    ).setAttribute("type", "checkbox");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    runMountedEffect((): void => {
      const isChecked: boolean | null = args.isChecked();
      if (prevCheckedValue === isChecked) {
        return;
      }

      prevCheckedValue = isChecked;
      checkboxElement.getRaw().checked = isChecked === true;
      checkboxElement.getRaw().indeterminate = isChecked === null;
    });

    if (args.isEnabled !== undefined) {
      // binding effect for enabled attribute
      let prevEnabledValue: boolean;
      runMountedEffect((): void => {
        const isEnabled: boolean = args.isEnabled!();
        if (prevEnabledValue === isEnabled) {
          return;
        }
        prevEnabledValue = isEnabled;
        checkboxElement.getRaw().disabled = !isEnabled;
      });
    }

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // checkbox element is to toggle.
    const originalOnClick = args.onClick;
    checkboxElement.getRaw().onclick = (): void => {
      originalOnClick();

      const isChecked: boolean | null = args.isChecked();
      checkboxElement.getRaw().checked = isChecked === true;
      checkboxElement.getRaw().indeterminate = isChecked === null;
    };

    return checkboxElement;
  }
);
