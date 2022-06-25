import {text, TextContent} from "./text";
import {Atom, isAtom} from "../../atom";

export type DivContent = Node;

export const div = (...children: DivContent[]): HTMLDivElement => {
    const element: HTMLDivElement = document.createElement(
        "div"
    );

    for (let child of children) {
        element.appendChild(child);
    }

    return element;
};