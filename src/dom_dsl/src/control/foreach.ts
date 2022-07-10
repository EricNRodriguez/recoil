import {Function, Supplier} from "../util.interface";
import {appendChildren, bindScope, removeChildren, replaceChildren} from "../util/dom_utils";
import {frag} from "../frag";
import {unwrapNodesFromBuilder} from "../vdom/vdom_util";
import {IndexedItem} from "../indexed_item.interface";
import {getItem, getKey} from "../indexed_item_lense";
import {runEffect} from "../../../atom";
import {MaybeNode, MaybeNodeOrNodeBuilder} from "../node.interface";

export const foreach = <T extends Object>(
    getItems: Supplier<IndexedItem<T>[]>,
    buildElement: Function<T, MaybeNodeOrNodeBuilder>
): Node => {
    const anchor = frag();

    bindScope(
        anchor,
        runEffect(
            buildUpdateAnchorSideEffect(
                anchor,
                getItems,
                buildElement
            ),
        ),
    );

    return anchor;
};

const buildUpdateAnchorSideEffect = <T>(
    anchor: Element,
    getItems: Supplier<IndexedItem<T>[]>,
    buildElement: Function<T, MaybeNodeOrNodeBuilder>
): () => void => {
    let currentItemOrder: string[] = [];
    let currentItemIndex: Map<string, MaybeNode> = new Map();

    return (): void => {
        const newItems: IndexedItem<T>[] = getItems();
        const newItemOrder: string[] = newItems.map(getKey);
        const newItemNodesIndex: Map<string, MaybeNode> = new Map(
            newItems.map((item: IndexedItem<T>): [string, MaybeNode] => [
                getKey(item),
                currentItemIndex.get(getKey(item)) ?? unwrapNodesFromBuilder<Node>(buildElement(getItem(item))),
            ]),
        );

        let firstNonEqualIndex: number = 0;
        while (firstNonEqualIndex < currentItemOrder.length &&
               firstNonEqualIndex < newItems.length &&
            currentItemOrder[firstNonEqualIndex] === newItemOrder[firstNonEqualIndex]) {
            ++firstNonEqualIndex;
        }

        removeChildren(
            anchor,
            currentItemOrder.slice(firstNonEqualIndex).map((index: string): MaybeNode => currentItemIndex.get(index)),
        );

        appendChildren(
            anchor,
            newItemOrder.slice(firstNonEqualIndex).map((index: string): MaybeNode => newItemNodesIndex.get(index))
        );

        currentItemOrder = newItemOrder;
        currentItemIndex = newItemNodesIndex;
    };
};
