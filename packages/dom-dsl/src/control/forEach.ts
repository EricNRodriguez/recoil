import { notNullOrUndefined, Supplier } from "../../../util";
import { WNode, wrapInVNode } from "../../../dom/src/node";
import {closeOverComponentState, createComponent, runMountedEffect} from "../../../component";
import { Function } from "../../../util";
import { createFragment } from "../../../dom";

// key value pair used for efficient indexing of existing built elements
export type IndexedItem<T> = [string, T];

export type MaybeNodeOrWNode = Node | WNode<Node> | undefined | null;

// utility lenses for unboxing index and item from an IndexedItem
export const getKey = <T>(item: IndexedItem<T>): string => item[0];
export const getItem = <T>(item: IndexedItem<T>): T => item[1];

export type ForEachProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, WNode<Node>>;
};

export const forEach = createComponent(<T extends Object>(props: ForEachProps<T>): WNode<Node> => {
    let { items, render } = props;

    render = closeOverComponentState(render);

    const anchor = createFragment([]);

    let currentItemIndex: Map<string, MaybeNodeOrWNode> = new Map();

    runMountedEffect((): void => {
      const newItems: IndexedItem<T>[] = items();
      const newItemOrder: string[] = newItems.map(getKey);
      const newItemNodesIndex: Map<string, MaybeNodeOrWNode> = new Map(
        newItems.map((item: IndexedItem<T>): [string, MaybeNodeOrWNode] => [
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
