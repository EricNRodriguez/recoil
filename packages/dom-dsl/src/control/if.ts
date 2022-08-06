import { IAtom, isAtom } from "../../../atom";
import {
  Supplier,
  notNullOrUndefined,
  wrapStaticContentInProvider,
  WDerivationCache,
  Producer,
} from "../../../util";
import { frag } from "../element";
import { MaybeNodeOrVNode } from "../element";
import { WElement, WNode } from "../../../dom";
import { createComponent, IComponentContext } from "../../index";
import { wrapInVNode } from "../../../dom/src/node";

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

    const nullOrUndefinedNode = new WNode(document.createComment("null"));
    const wrap = (fn: Producer<MaybeNodeOrVNode>): Producer<WNode<Node>> => {
      return () => wrapInVNode(fn()) ?? nullOrUndefinedNode;
    };
    const cache: WDerivationCache<boolean, WNode<Node>> = new WDerivationCache<
      boolean,
      WNode<Node>
    >((value: boolean) =>
      value ? wrap(ifTrueUnwrapped)() : wrap(ifFalseUnwrapped)()
    );

    const anchor = frag();

    let currentRenderedState: boolean;
    let currentRenderedSubtree: WNode<Node> = nullOrUndefinedNode;
    ctx.runEffect((): void => {
      const state: boolean = isAtom(condition)
        ? (condition as IAtom<boolean>).get()
        : (condition as Supplier<boolean>)();

      if (state === currentRenderedState) {
        return;
      }

      currentRenderedState = state;
      currentRenderedSubtree = cache.get(state);

      anchor.setChildren(
        currentRenderedSubtree === nullOrUndefinedNode
          ? null
          : currentRenderedSubtree
      );
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
