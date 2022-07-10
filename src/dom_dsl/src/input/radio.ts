import {VElement} from "../vdom/virtual_element.interface";
import {HtmlVElement} from "../vdom/virtual_element";
import {runEffect} from "../../../atom";
import {bindScope} from "../util/dom_utils";
import {Supplier} from "../util.interface";
import {Runnable} from "../../../atom/src/util.interface";

export type RadioButtonArguments = {
    isChecked: Supplier<boolean>,
    onClick: Runnable,
};

export const radioButton = (args: RadioButtonArguments): HtmlVElement => {
    const radioButtonElement: HtmlVElement = new HtmlVElement("input")
        .setAttribute("type", "radio");

    // binding effect for checked attribute
    let prevCheckedValue: boolean | null;
    radioButtonElement.registerEffect(
        runEffect((): void => {
            const isChecked: boolean | null = args.isChecked();
            if (prevCheckedValue === isChecked) {
                return;
            }

            prevCheckedValue = isChecked;
            (radioButtonElement.getRaw() as HTMLInputElement).checked = isChecked;
        })
    );

    // we want to trigger a re-bind once the onclick handle is executed.
    // this is important in the instance when the onClick handler does some
    // validation and decides to not toggle, but the default behaviour of the
    // element is to toggle.
    const originalOnClick = args.onClick;
    (radioButtonElement.getRaw() as HTMLInputElement).onclick = (): void => {
        originalOnClick();

        (radioButtonElement.getRaw() as HTMLInputElement).checked = args.isChecked();
    };

    return radioButtonElement;
};