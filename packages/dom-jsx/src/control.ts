import {createComponent, IComponentContext} from "../../component";
import {WNode} from "../../dom";
import {Function, Supplier} from "../../util";
import {forEach, IndexedItem} from "../../dom-dsl/src/control/forEach";
import {IAtom} from "../../atom";
import {frag, ifElse, tr} from "../../dom-dsl";

export type ForProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, WNode<Node>>;
};

export const For = createComponent(<T>(ctx: IComponentContext, props: ForProps<T>, ...children: WNode<Node>[]): WNode<Node> => {
  if (children.length !== 0) {
    throw new Error("For component requires children to be specified through the item attribute");
  }

  return forEach<T>(props);
});

const mintedTrueComponents: WeakSet<WNode<Node>> = new WeakSet();
export const True = createComponent((ctx: IComponentContext, props: {}, ...children: WNode<Node>[]): WNode<Node> => {
  const node = frag(...children);
  mintedTrueComponents.add(node);
  return node;
});


const mintedFalseComponents: WeakSet<WNode<Node>> = new WeakSet();
export const False = createComponent((ctx: IComponentContext, props: {}, ...children: WNode<Node>[]): WNode<Node> => {
  const node = frag(...children);
  mintedFalseComponents.add(node);
  return node;
});

export type IfProps = {
    condition: boolean | IAtom<boolean>;
};

export const If = createComponent((ctx: IComponentContext, props: IfProps, ...children: WNode<Node>[]): WNode<Node> => {
  const trueChildren = children
    .filter(mintedTrueComponents.has.bind(mintedTrueComponents));

  const falseChildren = children
    .filter(mintedFalseComponents.has.bind(mintedFalseComponents));

  return ifElse({
    condition: props.condition,
    ifTrue: () => frag(...trueChildren),
    ifFalse: () => frag(...falseChildren),
  });
});