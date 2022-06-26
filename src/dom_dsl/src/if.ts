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

    const anchor: HTMLElement = document.createElement("div");
    anchor.style.setProperty("display", "contents");

    let mountedNode: Node | undefined = undefined;

    atomFactory.createEffect((): void => {
        const state: boolean = isAtom(condition) ?
            (condition as Atom<boolean>).get() :
            (condition as Supplier<boolean>)();

        const node = state ? ifTrue : ifFalse;
        if (node === mountedNode) {
            return;
        }

        if (mountedNode !== undefined) {
            anchor.replaceChildren();
        }
        if (node === undefined || node === null) {
            return;
        }

        anchor.appendChild(node);

        mountedNode = node;
    });

    return anchor;
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