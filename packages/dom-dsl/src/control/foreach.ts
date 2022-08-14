import { frag, string } from "../element";
import { MaybeNodeOrVNode } from "../element";
import { WNode } from "../../../dom";
import { Supplier, Function, notNullOrUndefined } from "../../../util";
import { wrapInVNode } from "../../../dom/src/node";
import { createComponent, IComponentContext, lazy } from "../../../component";

// key value pair used for efficient indexing of existing built elements
export type IndexedItem<T> = [string, T];

// utility lenses for unboxing index and item from an IndexedItem
export const getKey = <T>(item: IndexedItem<T>): string => item[0];
export const getItem = <T>(item: IndexedItem<T>): T => item[1];

export type ForEachProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, WNode<Node>>;
};

export const foreach = createComponent(
  <T extends Object>(
    ctx: IComponentContext,
    props: ForEachProps<T>
  ): WNode<Node> => {
    let { items, render } = props;
    render = lazy(render);

    const anchor = frag();

    let currentItemIndex: Map<string, MaybeNodeOrVNode> = new Map();

    ctx.runEffect((): void => {
      const newItems: IndexedItem<T>[] = items();
      const newItemOrder: string[] = newItems.map(getKey);
      const newItemNodesIndex: Map<string, MaybeNodeOrVNode> = new Map(
        newItems.map((item: IndexedItem<T>): [string, MaybeNodeOrVNode] => [
          getKey(item),
          currentItemIndex.get(getKey(item)) ?? render(getItem(item)),
        ])
      );

      const newChildren: WNode<Node>[] = newItemOrder
        .map((key) => newItemNodesIndex.get(key))
        .map(wrapInVNode)
        .filter(notNullOrUndefined) as WNode<Node>[];

      anchor.setChildren(newChildren);

      currentItemIndex = newItemNodesIndex;
    });

    return anchor;
  }
);
