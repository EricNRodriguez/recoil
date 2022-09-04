import {forEach, ifElse, IndexedItem, match} from "../../dom-dsl";
import {IAtom, isAtom, runEffect} from "../../atom";
import { frag, th } from "../../dom-dsl";
import {createFragment, WElement, WNode} from "../../dom";
import {Component} from "./jsx";
import {Producer, Supplier, Function} from "../../utils/function.interface";
import {notNullOrUndefined} from "../../utils/type_check";

export type SupplyProps = {
  getChild: Producer<WNode<Node>>;
};

export const Supply: Component<SupplyProps, [], WNode<Node>> = (props: SupplyProps): WNode<Node> => {
  const node = frag();

  const ref = runEffect((): void => {
    node.setChildren([props.getChild()]);
  });
  node.registerOnMountHook(() => ref.activate());
  node.registerOnUnmountHook(() => ref.deactivate());

  return node;
};

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
}

export const Switch = <T extends Object>(props: SwitchProps<T>): WNode<Node> => {
  const caseMatchMap = new Map(props.cases);
  return match({
    state: props.value,
    render: (value: T) => {
      const result = caseMatchMap.get(value) ?? props.default ?? (() => createFragment([]));
      return result();
    },
  });
};

export type SuspenseProps = {
  default?: WNode<Node>;
};

export const Suspense = (props: SuspenseProps, ...children: Promise<WNode<Node>>[]
): WNode<Node> => {
  const anchor = frag();

  if (notNullOrUndefined(props.default)) {
    anchor.setChildren([props.default]);
  }

  Promise.all(children).then((syncChildren: WNode<Node>[]) => {
    anchor.setChildren(syncChildren);
  });

  return anchor;
};