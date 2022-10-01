import { IAtom, isAtom } from "recoiljs-atom";
import { WNode, createFragment } from "recoiljs-dom";
import { Supplier } from "shared";
import {runRenderEffect} from "../binding/dom";

export type IfElseCondition = IAtom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent = Supplier<WNode<Node>>;

export type IfElseProps = {
  condition: IfElseCondition;
  ifTrue: IfElseContent;
  ifFalse?: IfElseContent;
};

const nullOrUndefinedNode = new WNode(document.createComment("null"));
export const ifElse = (props: IfElseProps): WNode<Node> => {
  let { condition, ifTrue, ifFalse } = props;

  ifFalse ??= () => nullOrUndefinedNode;

  if (typeof condition === "boolean") {
    return staticIfElse(condition, ifTrue, ifFalse);
  }
  const anchor = createFragment([]);

  let currentRenderedState: boolean;
  let currentRenderedSubtree: WNode<Node> = nullOrUndefinedNode;
  const ref = runRenderEffect((): void => {
    const state: boolean = isAtom(condition)
      ? (condition as IAtom<boolean>).get()
      : (condition as Supplier<boolean>)();

    if (state === currentRenderedState) {
      return;
    }

    currentRenderedState = state;
    currentRenderedSubtree.cleanup();
    currentRenderedSubtree = state ? ifTrue() : ifFalse!();

    anchor.setChildren([
      currentRenderedSubtree === nullOrUndefinedNode
        ? null
        : currentRenderedSubtree,
    ]);
  });
  anchor.registerOnUnmountHook(() => ref.deactivate());
  anchor.registerOnMountHook(() => ref.activate());

  return anchor;
};
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
