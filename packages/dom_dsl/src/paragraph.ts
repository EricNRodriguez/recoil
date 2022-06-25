import {text} from "./text";

type ParagraphContent = Text;

export const p = (...children: ParagraphContent[]): HTMLDivElement => {
    const element: HTMLParagraphElement = document.createElement(
        "p"
    );

    for (let child of children) {
        element.appendChild(child);
    }

    return element;
};