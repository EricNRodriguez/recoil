import {createComponent, runMountedEffect} from "../../../../dom-component";
import {HtmlVElement} from "../../../../vdom";
import {Runnable, Supplier} from "../../../../util";

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
    runMountedEffect((): void => {
      const isChecked: boolean | null = args.isChecked();
      if (prevCheckedValue === isChecked) {
        return;
      }

      prevCheckedValue = isChecked;
      (checkboxElement.getRaw() as HTMLInputElement).checked =
        isChecked === true;
      (checkboxElement.getRaw() as HTMLInputElement).indeterminate =
        isChecked === null;
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
        (checkboxElement.getRaw() as HTMLInputElement).disabled = !isEnabled;
      });
    }

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // checkbox element is to toggle.
    const originalOnClick = args.onClick;
    (checkboxElement.getRaw() as HTMLInputElement).onclick = (): void => {
      originalOnClick();

      const isChecked: boolean | null = args.isChecked();
      (checkboxElement.getRaw() as HTMLInputElement).checked =
        isChecked === true;
      (checkboxElement.getRaw() as HTMLInputElement).indeterminate =
        isChecked === null;
    };

    return checkboxElement;
  }
);
