import { frag } from "../element/frag";
import { IndexedItem } from "../element/indexed_item.interface";
import { getItem, getKey } from "../element/indexed_item_lense";
import { MaybeNodeOrVNode } from "../element/node.interface";
import { HtmlVNode } from "recoil-vdom";
import { runMountedEffect, createComponent } from "recoil-dom-component";
import {Supplier} from "recoil-util";

export const foreach = createComponent(
  <T extends Object>(
    getItems: Supplier<IndexedItem<T>[]>,
    buildElement: Function
  ): HtmlVNode => {
    const anchor = frag();

    let currentItemOrder: string[] = [];
    let currentItemIndex: Map<string, MaybeNodeOrVNode> = new Map();

    runMountedEffect((): void => {
      const newItems: IndexedItem<T>[] = getItems();
      const newItemOrder: string[] = newItems.map(getKey);
      const newItemNodesIndex: Map<string, MaybeNodeOrVNode> = new Map(
        newItems.map((item: IndexedItem<T>): [string, MaybeNodeOrVNode] => [
          getKey(item),
          currentItemIndex.get(getKey(item)) ?? buildElement(getItem(item)),
        ])
      );

      let firstNonEqualIndex: number = 0;
      while (
        firstNonEqualIndex < currentItemOrder.length &&
        firstNonEqualIndex < newItems.length &&
        currentItemOrder[firstNonEqualIndex] ===
          newItemOrder[firstNonEqualIndex]
      ) {
        ++firstNonEqualIndex;
      }

      queueMicrotask((): void => {
        anchor.deleteChildren(firstNonEqualIndex);
        anchor.appendChildren(
          newItemOrder
            .slice(firstNonEqualIndex)
            .map((key) => newItemNodesIndex.get(key))
        );

        currentItemOrder = newItemOrder;
        currentItemIndex = newItemNodesIndex;
      });
    });

    return anchor;
  }
);
