import {Supplier} from "../../util";
import {deriveState, IAtom, isAtom} from "../../atom";
import {createTextNode, WNode} from "../../dom";

export type TextNodeTypes = string | boolean | number;
export type TextNodeSource = TextNodeTypes | Supplier<TextNodeTypes> | IAtom<TextNodeTypes>;
export const $ = (data: TextNodeSource): WNode<Node> => {
    if (isAtom(data)) {
        return createTextNode((data as IAtom<TextNodeTypes>).map((v: TextNodeTypes) => v.toString()));
    } else if (typeof data === "function") {
        return createTextNode(deriveState(() => (data as Supplier<TextNodeTypes>)().toString()));
    } else {
      return createTextNode(data.toString());
    }
};