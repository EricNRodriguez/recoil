import {ElementBuilderImpl} from "../vdom/virtual_element";
import {runEffect} from "../../../atom";
import {bindScope} from "../util/dom_utils";
import {Supplier} from "../util.interface";
import {Runnable} from "../../../atom/src/util.interface";
import {ElementBuilder} from "../vdom/virtual_element.interface";

export type CheckboxArguments = {
    isChecked: Supplier<boolean | null>,
    isEnabled?: Supplier<boolean>,
    onClick: Runnable,
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

    if (args.isEnabled !== undefined) {
        // binding effect for enabled attribute
        let prevEnabledValue: boolean;
        bindScope(
            checkboxElement,
            runEffect((): void => {
                const isEnabled: boolean = args.isEnabled!();
                if (prevEnabledValue === isEnabled) {
                    return;
                }
                prevEnabledValue = isEnabled;
                checkboxElement.disabled = !isEnabled;
            }),
        );
    }

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // checkbox element is to toggle.
    const originalOnClick = args.onClick;
    checkboxElement.onclick = (): void => {
        originalOnClick();

        const isChecked: boolean | null = args.isChecked();
        checkboxElement.checked = isChecked === true;
        checkboxElement.indeterminate = isChecked === null;
    };

    return new ElementBuilderImpl(checkboxElement)
        .withAttribute("type", "checkbox");
};