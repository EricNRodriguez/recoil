import {ElementBuilder} from "./builder/element_builder.interface";
import {ElementBuilderImpl} from "./builder/element_builder";
import {runEffect} from "../../atom";
import {bindScope} from "./dom_utils";
import {Supplier} from "./util.interface";
import {Runnable} from "../../atom/src/util.interface";

export type CheckboxArguments = {
    isChecked: Supplier<boolean | null>,
    isEnabled?: Supplier<boolean>,
    onClick: Runnable,
};

export const checkbox = (args: CheckboxArguments): ElementBuilder => {
    const checkboxElement = document.createElement("input");

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // checkbox element is to toggle.
    const originalOnClick = args.onClick;
    args.onClick = (): void => {
        originalOnClick();

        const isChecked: boolean | null = args.isChecked();
        checkboxElement.checked = isChecked === true;
        checkboxElement.indeterminate = isChecked === null;
    };

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

    return new ElementBuilderImpl(checkboxElement)
        .withAttribute("type", "checkbox")
        .withClickHandler((event: Event): void => args.onClick());
};