import { WElement } from "./element";
import { WNode } from "./node";
import { GlobalEventCoordinator } from "./event";

export type Props = Record<string, any>;
export type Children = WNode<Node>[];

const globalEventCoordinator: GlobalEventCoordinator =
  new GlobalEventCoordinator();

export const wrapElement = <K extends keyof HTMLElementTagNameMap>(
  rawElement: HTMLElementTagNameMap[K]
): WElement<HTMLElementTagNameMap[K]> => {
  return new WElement<HTMLElementTagNameMap[K]>(
    rawElement,
    globalEventCoordinator
  );
};

export const wrapNode = <T extends Node>(rawNode: T): WNode<T> => {
  return new WNode(rawNode);
};

export const createFragment = (children: Children): WNode<DocumentFragment> => {
  return new WNode(document.createDocumentFragment()).setChildren(children);
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props,
  children: Children
): WElement<HTMLElementTagNameMap[K]> => {
  const node = new WElement(
    document.createElement(tag),
    globalEventCoordinator
  );

  node.setChildren(children);

  Object.entries(props).forEach(([key, val]) => {
    node.setProperty(key, val);
  });

  return node;
};

export const createTextNode = (text: string): WNode<Text> => {
  const node = new WNode(document.createTextNode(text));
  node.setProperty("textContent", text);
  return node;
};


export const runApp = (anchor: HTMLElement, app: WNode<Node>): void => {
  wrapElement(anchor).bindScopeToWrappedNode().setChildren([app]);
};
