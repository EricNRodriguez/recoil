import {Reference} from "../../atom/src/factory.interface";

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


// A registry used to keep references in memory for the lifetime of the node,
//
// This is intended to be used to bind the scope of side effects to the DOM nodes
// that they operate on. Since the atom DAG stores references weakly to prevent
// difficult to find memory leaks, effects will not be referred to strongly
// by the atom lib, with it being the responsibility of the callers to scope it.
//
// This introduces a second issue: Our effects refer strongly to our DOM nodes,
// so won't they cause a circular reference and never be collected by the weak
// map? Well turns out js weak maps are valid ephemerons, so this is a non-issue.
// https://blog.mozilla.org/sfink/2022/06/09/ephemeron-tables-aka-javascript-weakmaps/
const scopeContext: WeakMap<Node, Set<Reference>> = new WeakMap();

export const bindScope = (node: Node, reference: Reference): void => {
    if (!scopeContext.has(node)) {
        scopeContext.set(node, new Set());
    }

    scopeContext.get(node)!.add(reference);
};