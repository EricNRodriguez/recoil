import {HtmlVElement} from "../vdom/virtual_element";
import {runEffect} from "../../../atom";
import {bindScope} from "../util/dom_utils";
import {Supplier} from "../util.interface";
import {Runnable} from "../../../atom/src/util.interface";
import {VElement} from "../vdom/virtual_element.interface";

export type CheckboxArguments = {
    isChecked: Supplier<boolean | null>,
    isEnabled?: Supplier<boolean>,
    onClick: Runnable,
};

export const checkbox = (args: CheckboxArguments): HtmlVElement => {
    const checkboxElement: HtmlVElement = new HtmlVElement("input")
        .setAttribute("type", "checkbox");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    checkboxElement.registerSideEffect((): void => {
            const isChecked: boolean | null = args.isChecked();
            if (prevCheckedValue === isChecked) {
                return;
            }

            prevCheckedValue = isChecked;
            (checkboxElement.getRaw() as HTMLInputElement).checked = isChecked === true;
            (checkboxElement.getRaw() as HTMLInputElement).indeterminate = isChecked === null;
        }
    );

    if (args.isEnabled !== undefined) {
        // binding effect for enabled attribute
        let prevEnabledValue: boolean;
        checkboxElement.registerSideEffect((): void => {
                const isEnabled: boolean = args.isEnabled!();
                if (prevEnabledValue === isEnabled) {
                    return;
                }
                prevEnabledValue = isEnabled;
                (checkboxElement.getRaw() as HTMLInputElement).disabled = !isEnabled;
            }
        );
    }

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // checkbox element is to toggle.
    const originalOnClick = args.onClick;
    (checkboxElement.getRaw() as HTMLInputElement).onclick = (): void => {
        originalOnClick();

        const isChecked: boolean | null = args.isChecked();
        (checkboxElement.getRaw() as HTMLInputElement).checked = isChecked === true;
        (checkboxElement.getRaw() as HTMLInputElement).indeterminate = isChecked === null;
    };

    return checkboxElement;
};