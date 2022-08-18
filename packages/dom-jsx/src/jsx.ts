import { DomBuilder } from "../../component";
import { createElement, WNode } from "../../dom";
import { frag, t } from "../../dom-dsl";
import { ComponentChild } from "../../component/src/component_factory";

export const Fragment = Symbol();

export const jsx = (
  tag: string | DomBuilder<Object, WNode<Node>, ComponentChild> | Symbol,
  props: Object,
  ...children: WNode<Node>[]
): WNode<Node> => {
  if (tag === Fragment) {
    return frag(...children);
  }

  if (typeof tag === "function") {
    return (tag as DomBuilder<Object, WNode<Node>, ComponentChild>)(
      props,
      ...children
    );
  }

  if (typeof tag !== "string") {
    // TODO(ericr): more specific type and message
    throw new Error("tag type not supported");
  }

  return createElement(tag as keyof HTMLElementTagNameMap, props as Object, [
    ...children,
  ]);
};
