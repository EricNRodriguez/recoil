import { IAtom, isAtom } from "../../../atom";
import {
  Supplier,
  WDerivationCache,
} from "../../../util";
import { frag } from "../element";
import { WNode } from "../../../dom";
import { createComponent, IComponentContext } from "../../index";
import {lazy} from "../component/component_factory";

export type IfElseCondition = IAtom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent =  Supplier<WNode<Node>>;

const nullOrUndefinedNode = new WNode(document.createComment("null"));
export const ifElse = createComponent(
  (
    ctx: IComponentContext,
    condition: IfElseCondition,
    ifTrue: IfElseContent,
    ifFalse?: IfElseContent
  ): WNode<Node> => {
    ifFalse ??= () => nullOrUndefinedNode;

    ifTrue = lazy(ifTrue);
    ifFalse = lazy(ifFalse);

    if (typeof condition === "boolean") {
      return staticIfElse(condition, ifTrue, ifFalse);
    }

    const cache: WDerivationCache<boolean, WNode<Node>> = new WDerivationCache<
      boolean,
      WNode<Node>
    >((value: boolean) => value ? ifTrue() : ifFalse!(),
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

      anchor.setChildren([
        currentRenderedSubtree === nullOrUndefinedNode
          ? null
          : currentRenderedSubtree,
      ]);
    });

    return anchor;
  }
);

const staticIfElse = (
  condition: boolean,
  ifTrue: Supplier<WNode<Node>>,
  ifFalse: Supplier<WNode<Node>>
): WNode<Node> => {
  const anchor = frag();

  anchor.setChildren(
    [condition ? ifTrue() : ifFalse()].filter((c) => c !== nullOrUndefinedNode),
  );

  return anchor;
};
