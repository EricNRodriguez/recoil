import {Supplier} from "../../util";
import {deriveState, IAtom, isAtom} from "../../atom";
import {createTextNode, WNode} from "../../dom";

export type TextNodeTypes = string | boolean | number;
export type TextNodeSource = TextNodeTypes | Supplier<TextNodeTypes> | IAtom<TextNodeTypes>;
export const $ = (data: TextNodeSource): WNode<Node> => {
    if (isAtom(data)) {
        // TODO(ericr): introduce the concept of a "atomic mutation" to atoms to avoid having another
        // wrapper atom
        return createTextNode(deriveState(() => (data as IAtom<TextNodeTypes>).get().toString()));
    } else if (typeof data === "function") {
        return createTextNode(deriveState(() => (data as Supplier<TextNodeTypes>)().toString()));
    } else {
      return createTextNode(data.toString());
    }
};