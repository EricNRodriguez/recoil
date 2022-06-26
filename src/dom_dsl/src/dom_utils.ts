export const removeAllChildren = (node: Node): void => {
    while (node.firstChild !== null) {
        node.removeChild(node.firstChild);
    }
}

export const replaceChildren = (node: Element, ...children: (Node | undefined | null)[]): void => {
    const nonNullChildren: Node[] = children.filter(
        (child: Node | null | undefined): boolean => child !== null && child !== undefined
    ) as Node[];

    node.replaceChildren(
        ...nonNullChildren,
    );
};