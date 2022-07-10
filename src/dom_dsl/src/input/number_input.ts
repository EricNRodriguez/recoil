import {VElement} from "../vdom/virtual_element.interface";
import {VElementImpl} from "../vdom/virtual_element";
import {Consumer} from "../../../atom/src/util.interface";
import {notNullOrUndefined} from "../util/dom_utils";
import {clamp} from "../util/math_util";

export type NumberInputArgs = {
    max?: number,
    min?: number,
    onInput?: Consumer<number>,
};

export const numberInput = (args: NumberInputArgs): VElement => {
    const builder: VElement = new VElementImpl("input")
        .withAttribute("type", "number");

    if (notNullOrUndefined(args.onInput)) {
        builder.withEventHandler("input", (e: Event, element: HTMLElement): void => {
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
        builder.withAttribute("max", args.max!.toString());
    }

    if (notNullOrUndefined(args.min)) {
        builder.withAttribute("min", args.min!.toString());
    }

    return builder;
}