import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";
import {runEffect} from "../../atom";
import {bindScope, preventEventDefault} from "./dom_utils";
import {Supplier} from "./util.interface";

export type CheckboxArguments = {
    isChecked: Supplier<boolean | null>,
    isEnabled: Supplier<boolean>,
};

export const checkbox = (args: CheckboxArguments): ElementBuilder => {
    const checkboxElement = document.createElement("input");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    bindScope(
        checkboxElement,
        runEffect((): void => {
            const isChecked: boolean | null = args.isChecked();
            if (prevCheckedValue === isChecked) {
                return;
            }

            prevCheckedValue = isChecked;
            checkboxElement.checked = isChecked === true;
            checkboxElement.indeterminate = isChecked === null;
        }),
    );

    // binding effect for enabled attribute
    let prevEnabledValue: boolean;
    bindScope(
        checkboxElement,
        runEffect((): void => {
            const isEnabled: boolean = args.isEnabled();
            if (prevEnabledValue === isEnabled) {
                return;
            }
            prevEnabledValue = isEnabled;
            checkboxElement.disabled = !isEnabled;
        }),
    );

    return new ElementBuilderImpl(checkboxElement)
        .withAttribute("type", "checkbox")
        .withClickHandleDecorator(preventEventDefault);
};