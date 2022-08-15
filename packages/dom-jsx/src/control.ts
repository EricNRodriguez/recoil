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

export const True = createComponent((ctx: IComponentContext, props: {}, ...children: WNode<Node>[]): WNode<Node> => {
  const node = frag(...children);

  (node as any).$$$recoilIsTrueComponent = true;

  return node;
});


export const False = createComponent((ctx: IComponentContext, props: {}, ...children: WNode<Node>[]): WNode<Node> => {
  const node = frag(...children);

  (node as any).$$$recoilIsFalseComponent = true;

  return node;
});

export type IfProps = {
    when: boolean | IAtom<boolean>;
};

export const If = createComponent((ctx: IComponentContext, props: IfProps, ...children: WNode<Node>[]): WNode<Node> => {
  const trueChildren = children
    .filter((c) => (c as any).$$$recoilIsTrueComponent);

  const falseChildren = children
    .filter((c) => (c as any).$$$recoilIsFalseComponent);


  return ifElse({
    condition: props.when,
    ifTrue: () => frag(...trueChildren),
    ifFalse: () => frag(...falseChildren),
  });
});