import { Supplier } from "shared";
import { deriveState, IAtom, isAtom } from "recoiljs-atom";
import { createTextNode, WNode } from "recoiljs-dom";
import {t} from "recoiljs-dom-dsl";

export type TextNodeTypes = string | boolean | number;
export type TextNodeSource =
  | TextNodeTypes
  | Supplier<TextNodeTypes>
  | IAtom<TextNodeTypes>;
export const $ = (data: TextNodeSource): WNode<Node> => {
  if (isAtom(data)) {
    return t(
      (data as IAtom<TextNodeTypes>).map((v: TextNodeTypes) => v.toString())
    );
  } else if (typeof data === "function") {
    return t(
      deriveState(() => (data as Supplier<TextNodeTypes>)().toString())
    );
  } else {
    return t(data.toString());
  }
};
