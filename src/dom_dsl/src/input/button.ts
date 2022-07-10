import {ElementBuilder} from "../vdom/virtual_element.interface";
import {ElementBuilderImpl} from "../vdom/virtual_element";
import {Consumer} from "../../../atom/src/util.interface";

export type ButtonContent = Text | string;

export type ButtonArgs = {
    content: ButtonContent,
    onClick: Consumer<MouseEvent>,
};

export const button = (args: ButtonArgs): ElementBuilder => {
    return new ElementBuilderImpl("button")
        .withAttribute("type", "button")
        .withChildren(args.content)
        .withClickHandler(args.onClick);
};