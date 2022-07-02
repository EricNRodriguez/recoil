import {Atom, createState, deriveState, runEffect, isAtom, Reference} from "../../atom";
import {Supplier} from "./util.interface";
import {bindScope, replaceChildren} from "./dom_utils";
import {NodeBuilder} from "./builder/node_builder.interface";
import {unwrapNodesFromBuilder, unwrapNodesFromProvider} from "./builder/builder_util";
import {frag} from "./frag";

export type IfElseCondition = Atom<boolean> | Supplier<boolean> | boolean;

export type NodeProvider = Supplier<Node | NodeBuilder | null | undefined>;

export const ifElse = (
    condition: IfElseCondition,
    ifTrue: NodeProvider,
    ifFalse?: NodeProvider,
): Node | null | undefined  => {

    const ifTrueUnwrapped: Supplier<Node | null | undefined> = unwrapNodesFromProvider(ifTrue);
    const ifFalseUnwrapped: Supplier<Node | null | undefined> = unwrapNodesFromProvider(ifFalse ?? (() => null));

    if (typeof condition === "boolean") {
        return staticIfElse(condition, ifTrueUnwrapped, ifFalseUnwrapped);
    }

    const anchor: Element = frag();

    let currentRenderedState: boolean;

    const effectRef: Reference = runEffect((): void => {
        const state: boolean = isAtom(condition) ?
            (condition as Atom<boolean>).get() :
            (condition as Supplier<boolean>)();

        if (state === currentRenderedState) {
            return;
        }

        currentRenderedState = state;

        const nodeSupplier: Supplier<Node | null | undefined> = state ? ifTrueUnwrapped : ifFalseUnwrapped;
        const node: Node | null | undefined = nodeSupplier();

        replaceChildren(
            anchor,
            node,
        )
    });
    bindScope(anchor, effectRef);

    return anchor;
};

const staticIfElse = (
    condition: boolean,
    ifTrue: Supplier<Node | null | undefined>,
    ifFalse: Supplier<Node | null | undefined>,
): Node | null | undefined => {
    if (condition) {
        return ifTrue();
    } else {
        return ifFalse();
    }
}