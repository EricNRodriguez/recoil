import { HtmlVElement } from "../../vdom/virtual_element";
import { clamp } from "../../../../util/src/math";
import { notNullOrUndefined } from "../../../../util";
import { LeafAtom, runEffect } from "../../../../atom";
import {
  createComponent,
  runMountedEffect,
} from "../../component/create_component";

export type NumberInputArgs = {
  max?: number;
  min?: number;
  num: LeafAtom<number>;
};

export const numberInput = createComponent(
  (args: NumberInputArgs): HtmlVElement => {
    const builder: HtmlVElement = new HtmlVElement("input").setAttribute(
      "type",
      "number"
    );

    builder.addEventHandler("input", (): void => {
      const inputElement: HTMLInputElement =
        builder.getRaw() as HTMLInputElement;

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

      args.num.set(clampedValue);
    });

    runMountedEffect((): void => {
      (builder.getRaw() as HTMLInputElement).value = clamp({
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
