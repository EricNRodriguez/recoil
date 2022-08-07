import { frag } from "../element";
import { IndexedItem } from "../element";
import { getItem, getKey } from "../element";
import { MaybeNodeOrVNode } from "../element";
import { WNode } from "../../../dom";
import { IComponentContext, createComponent } from "../../index";
import { Supplier, Function, notNullOrUndefined } from "../../../util";
import { wrapInVNode } from "../../../dom/src/node";

export const foreach = createComponent(
  <T extends Object>(
    ctx: IComponentContext,
    getItems: Supplier<IndexedItem<T>[]>,
    buildElement: Function<T, WNode<Node>>
  ): WNode<Node> => {
    const anchor = frag();

    let currentItemIndex: Map<string, MaybeNodeOrVNode> = new Map();

    ctx.runEffect((): void => {
      const newItems: IndexedItem<T>[] = getItems();
      const newItemOrder: string[] = newItems.map(getKey);
      const newItemNodesIndex: Map<string, MaybeNodeOrVNode> = new Map(
        newItems.map((item: IndexedItem<T>): [string, MaybeNodeOrVNode] => [
          getKey(item),
          currentItemIndex.get(getKey(item)) ?? buildElement(getItem(item)),
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
