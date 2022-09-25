import { WNode } from "recoiljs-dom";
import { Function, Supplier } from "shared";
import { createFragment } from "recoiljs-dom";
import { runEffect } from "recoiljs-atom";
import { notNullOrUndefined } from "shared";
import {runRenderEffect} from "../binding/dom";

// key value pair used for efficient indexing of existing built elements
export type IndexedItem<T> = [string, T];

// utility lenses for unboxing index and item from an IndexedItem
export const getKey = <T>(item: IndexedItem<T>): string => item[0];
export const getItem = <T>(item: IndexedItem<T>): T => item[1];

export type ForEachProps<T> = {
  items: Supplier<IndexedItem<T>[]>;
  render: Function<T, WNode<Node>>;
};

export const forEach = <T extends Object>(
  props: ForEachProps<T>
): WNode<Node> => {
  let { items, render } = props;

  const anchor = createFragment([]);

  let currentItemIndex: Map<string, WNode<Node>> = new Map();

  const ref = runRenderEffect((): void => {
    const newItems: IndexedItem<T>[] = items();
    const newItemOrder: string[] = newItems.map(getKey);
    const newItemNodesIndex: Map<string, WNode<Node>> = new Map(
      newItems.map((item: IndexedItem<T>): [string, WNode<Node>] => [
        getKey(item),
        currentItemIndex.get(getKey(item)) ?? render(getItem(item)),
      ])
    );

    const newChildren: WNode<Node>[] = newItemOrder
      .map((key) => newItemNodesIndex.get(key))
      .filter(notNullOrUndefined) as WNode<Node>[];

    anchor.setChildren(newChildren);

    currentItemIndex = newItemNodesIndex;
  });
  anchor.registerOnMountHook(() => ref.activate());
  anchor.registerOnUnmountHook(() => ref.deactivate());

  return anchor;
};
