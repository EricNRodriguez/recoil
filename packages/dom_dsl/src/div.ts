export type DivContent = Node | Element;

export const div = (...children: DivContent[]): Element => {
    const element: HTMLDivElement = document.createElement(
        "div"
    );

    for (let child of children) {
        element.appendChild(child);
    }

    return element;
};