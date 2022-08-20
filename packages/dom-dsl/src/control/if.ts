import {IAtom, isAtom} from "../../../atom";
import {Supplier, WDerivationCache} from "../../../util";
import {WNode} from "../../../dom/src/core/node";
import {createComponent, lazy} from "../../../dom/src/component/api/component_factory";
import {IComponentContext} from "../../../dom/src/component/api/component_context";
import {createFragment} from "../../../dom/src/core/factory";

export type IfElseCondition = IAtom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent = Supplier<WNode<Node>>;

export type IfElseProps = {
  condition: IfElseCondition;
  ifTrue: IfElseContent;
  ifFalse?: IfElseContent;
};

const nullOrUndefinedNode = new WNode(document.createComment("null"));
export const ifElse = createComponent(
  (ctx: IComponentContext, props: IfElseProps): WNode<Node> => {
    let { condition, ifTrue, ifFalse } = props;

    ifFalse ??= () => nullOrUndefinedNode;

    const ifTrueWrapped = () => lazy((_) => ifTrue())({});
    const ifFalseWrapped = () => lazy((_) => ifFalse!())({});

    if (typeof condition === "boolean") {
      return staticIfElse(condition, ifTrueWrapped, ifFalseWrapped);
    }

    const cache: WDerivationCache<boolean, WNode<Node>> = new WDerivationCache<
      boolean,
      WNode<Node>
    >((value: boolean) => (value ? ifTrueWrapped() : ifFalseWrapped()));

    const anchor = createFragment([]);

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
  const anchor = createFragment([]);

  anchor.setChildren(
    [condition ? ifTrue() : ifFalse()].filter((c) => c !== nullOrUndefinedNode)
  );

  return anchor;
};
