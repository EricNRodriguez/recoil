import { VNode } from "./virtual_node.interface";
import { t } from "../text";
import { HtmlVNode } from "./virtual_node";
import { nullOrUndefined, Supplier } from "../../../util";

export const isVNode = (content: any): boolean => {
  return content instanceof Object && "getRaw" in content;
};

export const unwrapVNode = (content: Node | VNode<any, any>): Node => {
  if (content === null || content === undefined) {
    return content;
  }

  if (isVNode(content)) {
    return (content as HtmlVNode).getRaw();
  }

  return content as Node;
};

export const wrapStaticContentInProvider = <T>(
  content: T | Supplier<T>
): Supplier<T> => {
  if (typeof content === "function") {
    return content as Supplier<T>;
  } else {
    return (): T => content;
  }
};

export const wrapInVNode = (
  node: VNode<any, any> | Node | string | null | undefined
): VNode<any, any> | null | undefined => {
  if (nullOrUndefined(node)) {
    return node as null | undefined;
  }

  if (isVNode(node)) {
    return node as VNode<any, any>;
  } else if (typeof node === "string") {
    return t(node as string);
  } else {
    return new HtmlVNode(node as Node);
  }
};
