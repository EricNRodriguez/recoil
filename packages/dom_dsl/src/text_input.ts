import {HtmlVElement} from "./vdom/virtual_element";
import {Consumer} from "../../util";

export type TextInputArgs = {
    onInput: Consumer<string | null>,
}

export const textInput = (args: TextInputArgs): HtmlVElement => {
    const inputElement = document.createElement("input");
    return new HtmlVElement(inputElement)
        .setAttribute("type", "text")
        .addEventHandler("input", () => args.onInput(inputElement.value));
};