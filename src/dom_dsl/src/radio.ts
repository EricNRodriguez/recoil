import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";
import {runEffect} from "../../atom";
import {bindScope} from "./dom_utils";
import {Supplier} from "./util.interface";
import {Runnable} from "../../atom/src/util.interface";

export type RadioButtonArguments = {
    isChecked: Supplier<boolean>,
    onClick: Runnable,
    value?: string,
};

export const radioButton = (args: RadioButtonArguments): ElementBuilder => {
    const radioButtonElement = document.createElement("input");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    bindScope(
        radioButtonElement,
        runEffect((): void => {
            const isChecked: boolean | null = args.isChecked();
            if (prevCheckedValue === isChecked) {
                return;
            }

            prevCheckedValue = isChecked;
            radioButtonElement.checked = isChecked;
        }),
    );

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // element is to toggle.
    const originalOnClick = args.onClick;
    args.onClick = (): void => {
        originalOnClick();

        radioButtonElement.checked = args.isChecked();
    };

    return new ElementBuilderImpl(radioButtonElement)
        .withAttribute("type", "radio")
        .withAttribute("value", args.value ?? "");
};