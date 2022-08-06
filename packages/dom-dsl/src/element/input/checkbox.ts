import { createComponent, IComponentContext } from "../../../../dom-component";
import { WElement } from "../../../../dom";
import {deriveState, IAtom} from "../../../../atom";
import {notNullOrUndefined} from "../../../../util";

export type CheckboxArguments = {
  isChecked: IAtom<boolean | null>;
  isEnabled?: IAtom<boolean>;
};

export const checkbox = createComponent(
  (
    ctx: IComponentContext,
    args: CheckboxArguments
  ): WElement<HTMLInputElement> => {
    return new WElement(document.createElement("input"))
      .setAttribute("type", "checkbox")
      .bindProperty("checked", () => args.isChecked.get() === true)
      .bindProperty("indeterminate", () => args.isChecked.get() === null)
      .bindProperty("disabled", (() => notNullOrUndefined(args.isEnabled) ? () => !args.isEnabled!.get() : () => false)());
  }
);

