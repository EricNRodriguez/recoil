export type DivContent = Node | Element;

export const div = (...children: DivContent[]): Element => {
    const element: HTMLDivElement = document.createElement(
        "div"
    );

    children.forEach(element.appendChild.bind(element));

    return element;
};