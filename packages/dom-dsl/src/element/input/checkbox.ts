import { createComponent, IComponentContext } from "../../../../dom-component";
import { WElement } from "../../../../dom";
import { IAtom } from "../../../../atom";

export type CheckboxArguments = {
  isChecked: IAtom<boolean | null>;
  isEnabled?: IAtom<boolean>;
};

export const checkbox = createComponent(
  (
    ctx: IComponentContext,
    args: CheckboxArguments
  ): WElement<HTMLInputElement> => {
    const checkboxElement: WElement<HTMLInputElement> = new WElement(
      document.createElement("input")
    ).setAttribute("type", "checkbox");

    // binding effect for checked attribute
    ctx.runEffect((): void => {
      const isChecked: boolean | null = args.isChecked.get();

      checkboxElement.unwrap().checked = isChecked === true;
      checkboxElement.unwrap().indeterminate = isChecked === null;
    });

    if (args.isEnabled !== undefined) {
      // binding effect for enabled attribute
      ctx.runEffect((): void => {
        const isEnabled: boolean = args.isEnabled!.get();
        checkboxElement.unwrap().disabled = !isEnabled;
      });
    }

    return checkboxElement;
  }
);
