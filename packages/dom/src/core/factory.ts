import { WElement } from "./element";
import { IAtom, isAtom, ISideEffectRef, runEffect } from "../../../atom";
import { WNode } from "./node";
import { GlobalEventCoordinator } from "./event";

type RawOrBinded<T> = IAtom<T> | T;
type Props = Record<string, RawOrBinded<any>>;
type Children = WNode<Node>[];

const globalEventCoordinator: GlobalEventCoordinator =
  new GlobalEventCoordinator();

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K | HTMLElementTagNameMap[K],
  props: Props,
  children: Children
): WElement<HTMLElementTagNameMap[K]> => {
  const node = new WElement(
    tag instanceof HTMLElement ? tag : document.createElement(tag),
    globalEventCoordinator
  );

  node.setChildren(children);

  Object.entries(props).forEach(([key, val]) => {
    node.setProperty(key, val);
    if (isAtom(val)) {
      const ref: ISideEffectRef = runEffect(() =>
        node.setProperty(key, val.get())
      );
      node.registerOnMountHook(() => ref.activate());
      node.registerOnUnmountHook(() => ref.deactivate());
    } else {
      node.setProperty(key, val);
    }
  });

  return node;
};

export const createTextNode = (text: RawOrBinded<string>): WNode<Text> => {
  const node = new WNode(document.createTextNode(""));

  if (isAtom(text)) {
    const ref: ISideEffectRef = runEffect(() =>
      node.setProperty("textContent", (text as IAtom<string>).get())
    );
    node.registerOnMountHook(ref.activate.bind(ref));
    node.registerOnUnmountHook(ref.deactivate.bind(ref));
  } else {
    node.setProperty("textContent", text as string);
  }

  return node;
};

export const createFragment = (children: Children): WNode<DocumentFragment> => {
  return new WNode(document.createDocumentFragment()).setChildren(children);
};
