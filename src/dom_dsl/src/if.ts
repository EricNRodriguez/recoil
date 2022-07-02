import {Atom, runEffect, isAtom, Reference} from "../../atom";
import {Supplier} from "./util.interface";
import {bindScope, replaceChildren} from "./dom_utils";
import {unwrapNodesFromProvider} from "./builder/builder_util";
import {frag} from "./frag";
import {MaybeNode, MaybeNodeOrNodeBuilder} from "./node.interface";

export type IfElseCondition = Atom<boolean> | Supplier<boolean> | boolean;

export type NodeProvider = Supplier<MaybeNodeOrNodeBuilder>;

export const ifElse = (
    condition: IfElseCondition,
    ifTrue: NodeProvider,
    ifFalse?: NodeProvider,
): Node  => {
    ifFalse ??= () => undefined;

    const ifTrueUnwrapped: Supplier<MaybeNode> = unwrapNodesFromProvider(ifTrue);
    const ifFalseUnwrapped: Supplier<MaybeNode> = unwrapNodesFromProvider(ifFalse);

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

        const nodeSupplier: Supplier<MaybeNode> = state ? ifTrueUnwrapped : ifFalseUnwrapped;
        const node: MaybeNode = nodeSupplier();

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
    ifTrue: Supplier<MaybeNode>,
    ifFalse: Supplier<MaybeNode>,
): Node => {
    return frag(
        condition ? ifTrue() : ifFalse()
    );
}