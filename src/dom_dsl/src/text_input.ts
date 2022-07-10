import {VElement} from "./vdom/virtual_element.interface";
import {HtmlVElement} from "./vdom/virtual_element";
import {Consumer} from "../../atom/src/util.interface";

export type TextInputArgs = {
    onInput: Consumer<string | null>,
}

export const textInput = (args: TextInputArgs): VElement => {
    const inputElement = document.createElement("input");
    return new HtmlVElement(inputElement)
        .setAttribute("type", "text")
        .addEventHandler("input", () => args.onInput(inputElement.value));
};