import { createFragment } from "recoiljs-dom";
import { createBindedElement } from "recoiljs-dom-dsl";

/**
 * A strict definition for all custom jsx components to adhere to.
 */
export type Component<
  Props extends Object,
  Children extends Node[],
  ReturnNode extends Node
> = (props: Props, ...children: [...Children]) => ReturnNode;

export const Fragment = Symbol();

export const jsx = (
  tag: string | Component<Object, Node[], Node> | Symbol,
  props: Object,
  ...children: Node[]
): Node => {
  if (tag === Fragment) {
    return createFragment(children);
  }

  if (typeof tag === "function") {
    return (tag as Component<Object, Node[], Node>)(
      props,
      ...children
    );
  }

  if (typeof tag !== "string") {
    // TODO(ericr): more specific type and message
    throw new Error("tag type not supported");
  }

  return createBindedElement(
    tag as keyof HTMLElementTagNameMap,
    props,
    children
  );
};
