import {
  Function,
  notNullOrUndefined,
  nullOrUndefined,
  Producer,
  Supplier,
} from "../../util";
import { forEach, IndexedItem } from "../../dom-dsl"
import {IAtom, isAtom, runEffect} from "../../atom";
import { frag, th } from "../../dom-dsl";
import {WElement, WNode} from "../../dom";
import {Component} from "./jsx";

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

export const For = <T>(props: ForProps<T>): WNode<Node> => {
    return forEach<T>(props);
  }
;

export type IfProps = {
  condition: boolean | IAtom<boolean>;
};

export const If = (props: IfProps, ...children: WNode<Node>[]): WNode<Node> => {
    return Switch({ value: props.condition }, ...children);
};

export type CaseProps<T> = {
  value: T;
};

const mintedCaseComponents: WeakMap<WNode<Node>, any> = new WeakMap();
export const Case = <T>(props: CaseProps<T>, ...children: WNode<Node>[]): WNode<Node> => {
    const node = frag(...children);
    mintedCaseComponents.set(node, props.value);
    return node;
};

export type SwitchProps<T> = {
  value: T | IAtom<T>;
};

export const Switch = <T>(props: SwitchProps<T>, ...children: WNode<Node>[]): WNode<Node> => {
    const node = frag();

    const ref =runEffect((): void => {
      node.setChildren([]);

      const val = isAtom(props.value)
        ? (props.value as IAtom<T>).get()
        : props.value;
      for (let child of children) {
        if (!mintedCaseComponents.has(child)) {
          throw new Error(
            "direct children of Switch context must be Case components"
          );
        }
        const childVal = mintedCaseComponents.get(child) ?? undefined;
        if (nullOrUndefined(childVal)) {
          continue;
        }
        if (childVal === val) {
          node.setChildren([child]);
          return;
        }
      }
    });
    node.registerOnUnmountHook(() => ref.deactivate());
    node.registerOnMountHook(() => ref.activate());

    return node;
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