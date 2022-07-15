import { HtmlVElement } from "../vdom/virtual_element";
import { clamp } from "../../../util/src/math";
import { Consumer, notNullOrUndefined } from "../../../util";

export type NumberInputArgs = {
  max?: number;
  min?: number;
  onInput?: Consumer<number>;
};

export const numberInput = (args: NumberInputArgs): HtmlVElement => {
  const builder: HtmlVElement = new HtmlVElement("input").setAttribute(
    "type",
    "number"
  );

  if (notNullOrUndefined(args.onInput)) {
    builder.addEventHandler("input", (e: Event, element: HTMLElement): void => {
      const inputElement: HTMLInputElement = element as HTMLInputElement;

      const rawValue: number = inputElement.valueAsNumber;

      if (Number.isNaN(rawValue)) {
        return;
      }

      const clampedValue: number = clamp({
        max: args.max,
        min: args.min,
        val: inputElement.valueAsNumber,
      });

      if (rawValue !== clampedValue) {
        inputElement.valueAsNumber = clampedValue;
      }

      args.onInput!(clampedValue);
    });
  }

  if (notNullOrUndefined(args.max)) {
    builder.setAttribute("max", args.max!.toString());
  }

  if (notNullOrUndefined(args.min)) {
    builder.setAttribute("min", args.min!.toString());
  }

  return builder;
};
