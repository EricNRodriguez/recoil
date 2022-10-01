import { forEach, ifElse, IndexedItem, match } from "recoiljs-dom-dsl";
import { IAtom } from "recoiljs-atom";
import { frag } from "recoiljs-dom-dsl";
import { createFragment, WNode } from "recoiljs-dom";
import { Supplier, Function } from "shared";
import { notNullOrUndefined } from "shared";

export type ForProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, WNode<Node>>;
};

export const For = <T extends Object>(props: ForProps<T>): WNode<Node> => {
  return forEach<T>(props);
};

export type IfProps = {
  condition: boolean | IAtom<boolean>;
  true: Supplier<WNode<Node>>;
  false?: Supplier<WNode<Node>>;
};

export const If = (props: IfProps): WNode<Node> => {
  return ifElse({
    condition: props.condition,
    ifTrue: props.true,
    ifFalse: props.false,
  });
};

export type SwitchProps<T> = {
  value: IAtom<T>;
  cases: [T, Supplier<WNode<Node>>][];
  default?: Supplier<WNode<Node>>;
};

export const Switch = <T extends Object>(
  props: SwitchProps<T>
): WNode<Node> => {
  const caseMatchMap = new Map(props.cases);
  return match({
    state: props.value,
    render: (value: T) => {
      const result =
        caseMatchMap.get(value) ?? props.default ?? (() => createFragment([]));
      return result();
    },
  });
};

export type SuspenseProps = {
  default?: WNode<Node>;
};

export const Suspense = (
  props: SuspenseProps,
  ...children: Promise<WNode<Node>>[]
): WNode<Node> => {
  const anchor = frag();

  if (notNullOrUndefined(props.default)) {
    anchor.setChildren([props.default]);
  }

  Promise.all(children).then((syncChildren: WNode<Node>[]) => {
    const prevChildren: WNode<Node>[] = anchor.getChildren();
    anchor.setChildren(syncChildren);
    prevChildren.forEach((c) => c.cleanup());
  });

  return anchor;
};
