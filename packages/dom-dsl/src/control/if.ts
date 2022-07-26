import { IAtom, isAtom } from "../../../atom";
import {
  Supplier,
  notNullOrUndefined,
  wrapStaticContentInProvider,
} from "../../../util";
import { frag } from "../element/frag";
import { MaybeNodeOrVNode } from "../element/node.interface";
import { WElement, WNode } from "../../../dom";
import { createComponent, IComponentContext } from "../../../dom-component";

export type IfElseCondition = IAtom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent = MaybeNodeOrVNode | Supplier<MaybeNodeOrVNode>;

export const ifElse = createComponent(
  (
    ctx: IComponentContext,
    condition: IfElseCondition,
    ifTrue: IfElseContent,
    ifFalse?: IfElseContent
  ): WNode<Node> => {
    ifFalse ??= undefined;

    const ifTrueUnwrapped: Supplier<MaybeNodeOrVNode> =
      wrapStaticContentInProvider(ifTrue);
    const ifFalseUnwrapped: Supplier<MaybeNodeOrVNode> =
      wrapStaticContentInProvider(ifFalse);

    if (typeof condition === "boolean") {
      return staticIfElse(condition, ifTrueUnwrapped, ifFalseUnwrapped);
    }

    const anchor = frag();

    let currentRenderedState: boolean;
    let currentRenderedItem: MaybeNodeOrVNode;

    ctx.runEffect((): void => {
      const state: boolean = isAtom(condition)
        ? (condition as IAtom<boolean>).get()
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
): WNode<Node> => {
  const anchor = frag();

  const content: MaybeNodeOrVNode = condition ? ifTrue() : ifFalse();
  if (notNullOrUndefined(content)) {
    anchor.setChildren(condition ? ifTrue() : ifFalse());
  }
  return anchor;
};
