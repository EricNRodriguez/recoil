export const removeAllChildren = (node: Node): void => {
    while (node.firstChild !== null) {
        node.removeChild(node.firstChild);
    }
}