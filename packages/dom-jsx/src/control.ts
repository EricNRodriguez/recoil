import {IComponentContext, WNode} from "../../dom";
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
import {createComponent} from "../../dom/src/component/api/component_factory";

export type SupplyProps = {
  get: Producer<WNode<Node>>;
};

export const Supply = createComponent(
  (
    ctx: IComponentContext,
    props: SupplyProps,
    ...children: WNode<Node>[]
  ): WNode<Node> => {
    const node = frag();

    if (nonEmpty(children)) {
      throw new Error(
        "Supply children must be provided through the supplyNodes attribute"
      );
    }

    ctx.runEffect((): void => {
      node.setChildren([props.get()]);
    });

    return node;
  }
);

export type ForProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, WNode<Node>>;
};

export const For = createComponent(
  <T>(
    ctx: IComponentContext,
    props: ForProps<T>,
    ...children: WNode<Node>[]
  ): WNode<Node> => {
    if (children.length !== 0) {
      throw new Error(
        "For component requires children to be specified through the item attribute"
      );
    }

    return forEach<T>(props);
  }
);

export const True = createComponent(
  (
    ctx: IComponentContext,
    props: {},
    ...children: WNode<Node>[]
  ): WNode<Node> => {
    return Case({ value: true }, ...children);
  }
);

export const False = createComponent(
  (
    ctx: IComponentContext,
    props: {},
    ...children: WNode<Node>[]
  ): WNode<Node> => {
    return Case({ value: false }, ...children);
  }
);

export type IfProps = {
  condition: boolean | IAtom<boolean>;
};

export const If = createComponent(
  (
    ctx: IComponentContext,
    props: IfProps,
    ...children: WNode<Node>[]
  ): WNode<Node> => {
    return Switch({ value: props.condition }, ...children);
  }
);

export type CaseProps<T> = {
  value: T;
};

const mintedCaseComponents: WeakMap<WNode<Node>, any> = new WeakMap();
export const Case = createComponent(
  <T>(
    ctx: IComponentContext,
    props: CaseProps<T>,
    ...children: WNode<Node>[]
  ): WNode<Node> => {
    const node = frag(...children);
    mintedCaseComponents.set(node, props.value);
    return node;
  }
);

export type SwitchProps<T> = {
  value: T | IAtom<T>;
};

export const Switch = createComponent(
  <T>(
    ctx: IComponentContext,
    props: SwitchProps<T>,
    ...children: WNode<Node>[]
  ): WNode<Node> => {
    const node = frag();

    ctx.runEffect((): void => {
      node.setChildren([]);

      const val = isAtom(props.value)
        ? (props.value as IAtom<T>).get()
        : props.value;
      for (let child of children) {
        if (!mintedCaseComponents.has(child)) {
          throw new Error(
            "direct children of Switch component must be Case components"
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

export const Suspense = (props: SuspenseProps, ...children: Promise<WNode<Node>>[]): WNode<Node> => {
  const anchor = frag();

  if (notNullOrUndefined(props.default)) {
    anchor.setChildren([props.default]);
  }

  Promise.all(children).then((syncChildren: WNode<Node>[]) => {
    anchor.setChildren(syncChildren);
  });

  return anchor;
};
