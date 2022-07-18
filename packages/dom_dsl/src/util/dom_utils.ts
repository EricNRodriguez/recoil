import { MaybeNode } from "../element/node.interface";
import { removeNullAndUndefinedItems } from "../../../util";

export const replaceChildren = (
  node: Element,
  ...children: MaybeNode[]
): void => {
  node.replaceChildren(...removeNullAndUndefinedItems(children));
};

export const removeChildren = (node: Element, children: MaybeNode[]): void => {
  removeNullAndUndefinedItems(children).forEach((child: Node): void => {
    node.removeChild(child);
  });
};

export const appendChildren = (node: Element, children: MaybeNode[]): void => {
  removeNullAndUndefinedItems(children).forEach((child: Node): void => {
    node.appendChild(child);
  });
};

// A registry used to keep references in memory for the lifetime of the node.
//
// This is intended to be used to bind the scope of side effects to the DOM nodes
// that they operate on. Since the atom DAG stores references weakly to prevent
// difficult to find memory leaks, effects will not be referred to strongly
// by the atom lib, with it being the responsibility of the callers to scope it.
//
// One thought would be to do some fancy meta programming to figure out this at runtime,
// similar to dependency detection in the atom framework but via proxies... sounds yuck and
// over the top, this is fine for now.
//
// This introduces a second issue: Our effects refer strongly to our DOM nodes,
// so won't they cause a circular reference and never be collected by the weak
// map? Well turns out js weak maps are valid ephemerons, so this is a non-issue.
// https://blog.mozilla.org/sfink/2022/06/09/ephemeron-tables-aka-javascript-weakmaps/
const scopeContext: WeakMap<any, Set<Object>> = new WeakMap();

export const bindScope = (node: any, reference: Object): void => {
  if (!scopeContext.has(node)) {
    scopeContext.set(node, new Set());
  }

  scopeContext.get(node)!.add(reference);
};
