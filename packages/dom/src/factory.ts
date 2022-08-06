import { WElement } from "./element";
import { IAtom, isAtom } from "../../atom";
import { Supplier } from "../../util";
import { WNode } from "./node";
import {GlobalEventCoordinator} from "./event";

type Props = Record<string, any | IAtom<any> | Supplier<any>>;
type Children = WNode<Node>[];

const globalEventCoordinator: GlobalEventCoordinator = new GlobalEventCoordinator();

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K | HTMLElementTagNameMap[K],
  props: Props,
  children: Children
): WElement<HTMLElementTagNameMap[K]> => {
  const node = new WElement(tag instanceof HTMLElement ? tag : document.createElement(tag), globalEventCoordinator);

  node.setChildren(...children);

  Object.entries(props).forEach(([key, val]) => {
    if (typeof val === "string") {
      node.setProperty(key, val);
    } else if (isAtom(val) || typeof val === "function") {
      node.bindProperty(key, val);
    } else {
      throw new Error("invalid prop type");
    }
  });

  return node;
};

export const createFragment = (children: Children): WNode<DocumentFragment> => {
  return new WNode(document.createDocumentFragment()).setChildren(...children);
};
