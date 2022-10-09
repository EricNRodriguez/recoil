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

interface ReactProps {
  __source: any;
  __self: any;
  [key: string]: string | number;
}

const filterMetadataProps = (props: ReactProps): Object => {
  const { __source, __self, ...rest } = props;
  return rest;
};

export const jsx = (
  tag: string | Component<Object, Node[], Node> | Symbol,
  props: ReactProps,
  ...children: Node[]
): Node => {
  if (tag === Fragment) {
    return createFragment(children);
  }

  const domProps = filterMetadataProps(props);

  if (typeof tag === "function") {
    return (tag as Component<Object, Node[], Node>)(domProps, ...children);
  }

  if (typeof tag !== "string") {
    // TODO(ericr): more specific type and message
    throw new Error("tag type not supported");
  }

  return createBindedElement(
    tag as keyof HTMLElementTagNameMap,
    domProps,
    children
  );
};
