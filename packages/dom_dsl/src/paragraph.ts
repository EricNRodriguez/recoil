import {t} from "./text";

type ParagraphContent = Text;

export const p = (...children: ParagraphContent[]): Element => {
    const element: Element = document.createElement(
        "p"
    );

    for (let child of children) {
        element.appendChild(child);
    }

    return element;
};