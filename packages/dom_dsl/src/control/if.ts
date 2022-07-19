import { Atom, isAtom, runEffect } from "../../../atom";
import { Supplier } from "../../../util/src/function.interface";
import { wrapStaticContentInProvider } from "../vdom/vdom_util";
import { frag } from "../element/frag";
import { MaybeNodeOrVNode } from "../element/node.interface";
import { HtmlVElement } from "../vdom/virtual_element";
import { notNullOrUndefined } from "../../../util";
import {
  createComponent,
  runMountedEffect,
} from "../component/create_component";

export type IfElseCondition = Atom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent = MaybeNodeOrVNode | Supplier<MaybeNodeOrVNode>;

export const ifElse = createComponent(
  (
    condition: IfElseCondition,
    ifTrue: IfElseContent,
    ifFalse?: IfElseContent
  ): HtmlVElement => {
    ifFalse ??= undefined;

    const ifTrueUnwrapped: Supplier<MaybeNodeOrVNode> =
      wrapStaticContentInProvider(ifTrue);
    const ifFalseUnwrapped: Supplier<MaybeNodeOrVNode> =
      wrapStaticContentInProvider(ifFalse);

    if (typeof condition === "boolean") {
      return staticIfElse(condition, ifTrueUnwrapped, ifFalseUnwrapped);
    }

    const anchor: HtmlVElement = frag();

    let currentRenderedState: boolean;
    let currentRenderedItem: MaybeNodeOrVNode;

    runMountedEffect((): void => {
      const state: boolean = isAtom(condition)
        ? (condition as Atom<boolean>).get()
        : (condition as Supplier<boolean>)();

      if (state === currentRenderedState) {
        return;
      }

      currentRenderedState = state;

      const nodeSupplier: Supplier<MaybeNodeOrVNode> = state
        ? ifTrueUnwrapped
        : ifFalseUnwrapped;
      currentRenderedItem = nodeSupplier();

      anchor.setChildren(currentRenderedItem);
    });

    return anchor;
  }
);

const staticIfElse = (
  condition: boolean,
  ifTrue: Supplier<MaybeNodeOrVNode>,
  ifFalse: Supplier<MaybeNodeOrVNode>
): HtmlVElement => {
  const anchor = frag();

  const content: MaybeNodeOrVNode = condition ? ifTrue() : ifFalse();
  if (notNullOrUndefined(content)) {
    anchor.setChildren(condition ? ifTrue() : ifFalse());
  }
  return anchor;
};
