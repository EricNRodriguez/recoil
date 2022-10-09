import { IAtom, isAtom } from "recoiljs-atom";
import {
  cleanup,
  createFragment,
  registerOnMountHook,
  registerOnUnmountHook,
  setChildren,
} from "recoiljs-dom";
import { Supplier } from "shared";
import { runRenderEffect } from "../binding/dom";

export type IfElseCondition = IAtom<boolean> | Supplier<boolean> | boolean;

export type IfElseContent = Supplier<Node>;

export type IfElseProps = {
  condition: IfElseCondition;
  ifTrue: IfElseContent;
  ifFalse?: IfElseContent;
};

const nullOrUndefinedNode = document.createComment("null");
export const ifElse = (props: IfElseProps): Node => {
  let { condition, ifTrue, ifFalse } = props;

  ifFalse ??= () => nullOrUndefinedNode;

  if (typeof condition === "boolean") {
    return staticIfElse(condition, ifTrue, ifFalse);
  }
  const anchor = createFragment([]);

  let currentRenderedState: boolean;
  let currentRenderedSubtree: Node = nullOrUndefinedNode;
  const ref = runRenderEffect((): void => {
    const state: boolean = isAtom(condition)
      ? (condition as IAtom<boolean>).get()
      : (condition as Supplier<boolean>)();

    if (state === currentRenderedState) {
      return;
    }

    currentRenderedState = state;
    cleanup(currentRenderedSubtree);
    currentRenderedSubtree = state ? ifTrue() : ifFalse!();

    setChildren(
      anchor,
      currentRenderedSubtree === nullOrUndefinedNode
        ? []
        : [currentRenderedSubtree]
    );
  });
  registerOnMountHook(anchor, () => ref.activate());
  registerOnUnmountHook(anchor, () => ref.deactivate());

  return anchor;
};
const staticIfElse = (
  condition: boolean,
  ifTrue: Supplier<Node>,
  ifFalse: Supplier<Node>
): Node => {
  const anchor = createFragment([]);

  setChildren(
    anchor,
    [condition ? ifTrue() : ifFalse()].filter((c) => c !== nullOrUndefinedNode)
  );

  return anchor;
};
