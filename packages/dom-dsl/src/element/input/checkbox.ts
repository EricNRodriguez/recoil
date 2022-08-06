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
      .setProperty("checked", deriveState(() => args.isChecked.get() === true))
      .setProperty("indeterminate", deriveState(() => args.isChecked.get() === null))
      .setProperty("disabled", notNullOrUndefined(args.isEnabled) ?  deriveState(() => !args.isEnabled?.get()) : false);
  }
);
