import { ILeafAtom } from "../../../../atom";
import { createComponent, IComponentContext } from "../../../../dom-component";
import { WElement } from "../../../../dom";
import { clamp, notNullOrUndefined } from "../../../../util";

export type NumberInputArgs = {
  max?: number;
  min?: number;
  num: ILeafAtom<number>;
};

export const numberInput = createComponent(
  (
    ctx: IComponentContext,
    args: NumberInputArgs
  ): WElement<HTMLInputElement> => {
    const builder: WElement<HTMLInputElement> = new WElement(
      document.createElement("input")
    ).setAttribute("type", "number");

    builder.setEventHandler("input", (): void => {
      const inputElement = builder.unwrap();

      const rawValue: number = inputElement.valueAsNumber;

      if (Number.isNaN(rawValue)) {
        return;
      }

      const clampedValue: number = clamp({
        max: args.max,
        min: args.min,
        val: rawValue,
      });

      if (rawValue !== clampedValue) {
        inputElement.valueAsNumber = clampedValue;
      }

      args.num.set(clampedValue);
    });

    ctx.runEffect((): void => {
      (builder.unwrap() as HTMLInputElement).value = clamp({
        max: args.max,
        min: args.min,
        val: args.num.get(),
      }).toString();
    });

    if (notNullOrUndefined(args.max)) {
      builder.setAttribute("max", args.max!.toString());
    }

    if (notNullOrUndefined(args.min)) {
      builder.setAttribute("min", args.min!.toString());
    }

    return builder;
  }
);
