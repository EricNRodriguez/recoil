import {Atom, runEffect, isAtom} from "../../../atom";
import {Supplier} from "../util.interface";
import {notNullOrUndefined} from "../util/dom_utils";
import {isVNode, wrapStaticContentInProvider} from "../vdom/vdom_util";
import {frag} from "../frag";
import {MaybeNodeOrVNode} from "../node.interface";
import {HtmlVElement} from "../vdom/virtual_element";
import {HtmlVNode} from "../vdom/virtual_node";

export type IfElseCondition = Atom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent = MaybeNodeOrVNode | Supplier<MaybeNodeOrVNode>;

export const ifElse = (
    condition: IfElseCondition,
    ifTrue: IfElseContent,
    ifFalse?: IfElseContent,
): HtmlVElement  => {
    ifFalse ??= undefined;

    const ifTrueUnwrapped: Supplier<MaybeNodeOrVNode> = wrapStaticContentInProvider(ifTrue);
    const ifFalseUnwrapped: Supplier<MaybeNodeOrVNode> = wrapStaticContentInProvider(ifFalse);

    if (typeof condition === "boolean") {
        return staticIfElse(condition, ifTrueUnwrapped, ifFalseUnwrapped);
    }

    const anchor: HtmlVElement = frag();

    let currentRenderedState: boolean;
    let currentRenderedItem: MaybeNodeOrVNode;

    anchor.registerEffect(
        runEffect((): void => {
            const state: boolean = isAtom(condition) ?
                (condition as Atom<boolean>).get() :
                (condition as Supplier<boolean>)();

            if (state === currentRenderedState) {
                return;
            }

            if (isVNode(currentRenderedItem)) {
                (currentRenderedItem as HtmlVNode).unmount();
            }

            currentRenderedState = state;

            const nodeSupplier: Supplier<MaybeNodeOrVNode> = state ? ifTrueUnwrapped : ifFalseUnwrapped;
            currentRenderedItem = nodeSupplier();

            if (notNullOrUndefined(currentRenderedItem)) {
                (currentRenderedItem as HtmlVNode).mount();
            }

            anchor.setChildren(
                currentRenderedItem,
            )
        })
    );

    return anchor;
};

const staticIfElse = (
    condition: boolean,
    ifTrue: Supplier<MaybeNodeOrVNode>,
    ifFalse: Supplier<MaybeNodeOrVNode>,
): HtmlVElement => {
    const anchor = frag();

    const content: MaybeNodeOrVNode = condition ? ifTrue() : ifFalse();
    if (notNullOrUndefined(content)) {
        anchor.setChildren(
            condition ? ifTrue() : ifFalse(),
        )
    }
    return anchor;
};