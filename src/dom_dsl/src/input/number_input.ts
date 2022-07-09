import {ElementBuilder} from "../builder/element_builder.interface";
import {ElementBuilderImpl} from "../builder/element_builder";
import {Consumer} from "../../../atom/src/util.interface";
import {notNullOrUndefined} from "../dom_utils";

export type NumberInputArgs = {
    max?: number,
    min?: number,
    onInput?: Consumer<number>,
};

export const numberInput = (args: NumberInputArgs): ElementBuilder => {
    const builder: ElementBuilder = new ElementBuilderImpl("input")
        .withAttribute("type", "number");

    if (notNullOrUndefined(args.onInput)) {
        builder.withEventHandler("input", (e: Event, element: HTMLElement): void => {
            const inputElement: HTMLInputElement = element as HTMLInputElement;
            args.onInput!(inputElement.valueAsNumber);
        });
    }

    if (notNullOrUndefined(args.max)) {
        builder.withAttribute("max", args.max!.toString);
    }

    if (notNullOrUndefined(args.min)) {
        builder.withAttribute("min", args.min!.toString());
    }

    return builder;
}