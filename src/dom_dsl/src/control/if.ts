import {Atom, runEffect, isAtom, Reference} from "../../../atom";
import {Supplier} from "../util.interface";
import {bindScope, replaceChildren} from "../util/dom_utils";
import {unwrapNodesFromProvider, wrapStaticContentInProvider} from "../vdom/vdom_util";
import {frag} from "../frag";
import {MaybeNode, MaybeNodeOrVNode} from "../node.interface";

export type IfElseCondition = Atom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent = MaybeNodeOrVNode | Supplier<MaybeNodeOrVNode>;

export const ifElse = (
    condition: IfElseCondition,
    ifTrue: IfElseContent,
    ifFalse?: IfElseContent,
): Node  => {
    ifFalse ??= undefined;

    const ifTrueUnwrapped: Supplier<MaybeNode> = unwrapNodesFromProvider(
        wrapStaticContentInProvider(ifTrue)
    );
    const ifFalseUnwrapped: Supplier<MaybeNode> = unwrapNodesFromProvider(
        wrapStaticContentInProvider(ifFalse)
    );

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
};