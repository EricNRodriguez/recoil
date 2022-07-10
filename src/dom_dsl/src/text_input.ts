import {ElementBuilder} from "./vdom/virtual_element.interface";
import {ElementBuilderImpl} from "./vdom/virtual_element";
import {Consumer} from "../../atom/src/util.interface";

export type TextInputArgs = {
    onInput: Consumer<string | null>,
}

export const textInput = (args: TextInputArgs): ElementBuilder => {
    const inputElement = document.createElement("input");
    return new ElementBuilderImpl(inputElement)
        .withAttribute("type", "text")
        .withEventHandler("input", () => args.onInput(inputElement.value));
};