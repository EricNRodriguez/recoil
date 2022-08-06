import {WElement} from "./element";
import {IAtom, isAtom} from "../../atom";
import {Supplier} from "../../util";
import {WNode} from "./node";

// https://medium.com/front-end-weekly/vanilla-jsx-28ff15e82de8
type Props = Record<string, any | IAtom<any> | Supplier<any>>;
type Tag = string;
type Children = WNode<Node>[];

export const createElement = (tag: Tag, props: Props, children: Children): WElement<HTMLElement> => {
  const node = new WElement(document.createElement(tag));

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

