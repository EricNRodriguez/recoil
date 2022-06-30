import {Atom, createState, deriveState, runEffect, isAtom, Reference} from "../../atom";
import {Supplier} from "./util.interface";
import {bindScope, replaceChildren} from "./dom_utils";
import {NodeBuilder} from "./builder/node_builder.interface";
import {unwrapNodesFromBuilder} from "./builder/builder_util";
import {frag} from "./frag";

export type IfElseCondition = Atom<boolean> | Supplier<boolean> | boolean;

// TODO(ericr): inject view providers, rather than
// raw references, since this will leak lots of memory
//
// this component can keep weak references, however that should be transparent
// to the calling code
export const ifElse = (
    condition: IfElseCondition,
    ifTrue: Node | NodeBuilder,
    ifFalse?: Node | NodeBuilder,
): Node  => {
    const ifTrueUnwrapped: Node = unwrapNodesFromBuilder<Node>(ifTrue) as Node;
    const ifFalseUnwrapped: Node | undefined = unwrapNodesFromBuilder(ifFalse) as Node | undefined;

    if (typeof condition === "boolean") {
        return staticIfElse(condition, ifTrueUnwrapped, ifFalseUnwrapped);
    }

    const anchor: Element = frag();

    let mountedNode: Node | undefined = undefined;

    const effectRef: Reference = runEffect((): void => {
        const state: boolean = isAtom(condition) ?
            (condition as Atom<boolean>).get() :
            (condition as Supplier<boolean>)();

        const node = state ? ifTrueUnwrapped : ifFalseUnwrapped;

        if (node === mountedNode) {
            return;
        }

        replaceChildren(
            anchor,
            node,
        )

        mountedNode = node;
    });
    bindScope(anchor, effectRef);

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