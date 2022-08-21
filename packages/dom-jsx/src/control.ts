import {
  Function,
  notNullOrUndefined,
  nullOrUndefined,
  Producer,
  Supplier,
} from "../../util";
import { forEach, IndexedItem } from "../../dom-dsl/src/control/forEach";
import { IAtom, isAtom } from "../../atom";
import { frag, th } from "../../dom-dsl";
import { nonEmpty } from "../../util/src/type_check";
import {createContextualComponent, runMountedEffect} from "../../context";
import {WNode} from "../../dom";

export type SupplyProps = {
  getChild: Producer<WNode<Node>>;
};

export const Supply = createContextualComponent(
  (props: SupplyProps, ...children: WNode<Node>[]): WNode<Node> => {
    const node = frag();

    if (nonEmpty(children)) {
      throw new Error(
        "Supply children must be provided through the supplyNodes attribute"
      );
    }

    runMountedEffect((): void => {
      node.setChildren([props.getChild()]);
    });

    return node;
  }
);

export type ForProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, WNode<Node>>;
};

export const For = createContextualComponent(
  <T>(props: ForProps<T>): WNode<Node> => {
    return forEach<T>(props);
  }
);

export const True = createContextualComponent(
  (props: {}, ...children: WNode<Node>[]): WNode<Node> => {
    return Case({ value: true }, ...children);
  }
);

export const False = createContextualComponent(
  (props: {}, ...children: WNode<Node>[]): WNode<Node> => {
    return Case({ value: false }, ...children);
  }
);

export type IfProps = {
  condition: boolean | IAtom<boolean>;
};

export const If = createContextualComponent(
  (props: IfProps, ...children: WNode<Node>[]): WNode<Node> => {
    return Switch({ value: props.condition }, ...children);
  }
);

export type CaseProps<T> = {
  value: T;
};

const mintedCaseComponents: WeakMap<WNode<Node>, any> = new WeakMap();
export const Case = createContextualComponent(
  <T>(props: CaseProps<T>, ...children: WNode<Node>[]): WNode<Node> => {
    const node = frag(...children);
    mintedCaseComponents.set(node, props.value);
    return node;
  }
);

export type SwitchProps<T> = {
  value: T | IAtom<T>;
};

export const Switch = createContextualComponent(
  <T>(props: SwitchProps<T>, ...children: WNode<Node>[]): WNode<Node> => {
    const node = frag();

    runMountedEffect((): void => {
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

    return node;
  }
);

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
