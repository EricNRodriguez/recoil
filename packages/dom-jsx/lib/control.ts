import { forEach, ifElse, IndexedItem, match } from "recoiljs-dom-dsl";
import { IAtom } from "recoiljs-atom";
import { frag } from "recoiljs-dom-dsl";
import {cleanup, createFragment, setChildren} from "recoiljs-dom";
import { Supplier, Function } from "shared";
import { notNullOrUndefined } from "shared";

export type ForProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, Node>;
};

export const For = <T extends Object>(props: ForProps<T>): Node => {
  return forEach<T>(props);
};

export type IfProps = {
  condition: boolean | IAtom<boolean>;
  true: Supplier<Node>;
  false?: Supplier<Node>;
};

export const If = (props: IfProps): Node => {
  return ifElse({
    condition: props.condition,
    ifTrue: props.true,
    ifFalse: props.false,
  });
};

export type SwitchProps<T> = {
  value: IAtom<T>;
  cases: [T, Supplier<Node>][];
  default?: Supplier<Node>;
};

export const Switch = <T extends Object>(
  props: SwitchProps<T>
): Node => {
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
  default?: Node;
};

export const Suspense = (
  props: SuspenseProps,
  ...children: Promise<Node>[]
): Node => {
  const anchor = frag();

  if (notNullOrUndefined(props.default)) {
    setChildren(anchor, [props.default!]);
  }

  Promise.all(children).then((syncChildren: Node[]) => {
    setChildren(anchor, syncChildren);
    if (notNullOrUndefined(props.default)) {
      cleanup(props.default!);
    }
  });

  return anchor;
};
