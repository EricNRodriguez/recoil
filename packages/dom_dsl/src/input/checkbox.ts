import { HtmlVElement } from "../vdom/virtual_element";
import { Runnable, Supplier } from "../../../util/src/function.interface";
import { createComponent } from "../component/create_component";
import { runEffect } from "../../../atom";

export type CheckboxArguments = {
  isChecked: Supplier<boolean | null>;
  isEnabled?: Supplier<boolean>;
  onClick: Runnable;
};

export const checkbox = createComponent(
  (args: CheckboxArguments): HtmlVElement => {
    const checkboxElement: HtmlVElement = new HtmlVElement(
      "input"
    ).setAttribute("type", "checkbox");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    runEffect((): void => {
      const isChecked: boolean | null = args.isChecked();
      if (prevCheckedValue === isChecked) {
        return;
      }

      prevCheckedValue = isChecked;
      checkboxElement.setAttribute("checked", (isChecked === true).toString());
      checkboxElement.setAttribute("indeterminate", (isChecked === null).toString());
    });

    if (args.isEnabled !== undefined) {
      // binding effect for enabled attribute
      let prevEnabledValue: boolean;
      runEffect((): void => {
        const isEnabled: boolean = args.isEnabled!();
        if (prevEnabledValue === isEnabled) {
          return;
        }
        prevEnabledValue = isEnabled;
        checkboxElement.setAttribute("disabled", (!isEnabled).toString());
      });
    }

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // checkbox element is to toggle.
    const originalOnClick = args.onClick;
    checkboxElement.setClickHandler((e: MouseEvent): void => {
      originalOnClick();

      const isChecked: boolean | null = args.isChecked();
      checkboxElement.setAttribute("checked", (isChecked === true).toString());
      checkboxElement.setAttribute("indeterminate", (isChecked === null).toString());
    });

    return checkboxElement;
  }
);
