import {t} from "./text";

type ParagraphContent = Text;

export const p = (...children: ParagraphContent[]): Element => {
    const element: Element = document.createElement(
        "p"
    );

    children.forEach(element.appendChild.bind(element));

    return element;
};