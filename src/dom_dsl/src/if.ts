import {Atom, AtomFactory, buildFactory, isAtom} from "../../atom";
import {Supplier} from "./util.interface";
import {removeAllChildren} from "./dom_utils";

const atomFactory: AtomFactory = buildFactory();

export type IfElseCondition = Atom<boolean> | Supplier<boolean> | boolean;

export const ifElse = (
    condition: IfElseCondition,
    ifTrue: Node,
    ifFalse?: Node,
): Node  => {
    if (typeof condition === "boolean") {
        return staticIfElse(condition, ifTrue, ifFalse);
    }

    const commentAnchor: Comment = new Comment("ifElse-anchor");

    atomFactory.createEffect((): void => {
       const state: boolean = isAtom(condition) ?
           (condition as Atom<boolean>).get() :
           (condition as Supplier<boolean>)();

       removeAllChildren(commentAnchor);
       commentAnchor.appendChild(
           state ? ifTrue : ifFalse ?? new Comment("noop-false")
       );
    });

    return commentAnchor;
};

const staticIfElse = (
    condition: boolean,
    ifTrue: Node,
    ifFalse?: Node,
): Node => {
    if (condition) {
        return ifTrue;
    } else {
        return ifFalse ?? new Comment();
    }
}