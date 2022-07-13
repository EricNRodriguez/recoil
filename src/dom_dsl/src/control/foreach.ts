import {Function, Supplier} from "../util.interface";
import {frag} from "../frag";
import {IndexedItem} from "../indexed_item.interface";
import {getItem, getKey} from "../indexed_item_lense";
import {runEffect} from "../../../atom";
import {MaybeNodeOrVNode} from "../node.interface";
import {HtmlVNode} from "../vdom/virtual_node";
import {HtmlVElement} from "../vdom/virtual_element";

export const foreach = <T extends Object>(
    getItems: Supplier<IndexedItem<T>[]>,
    buildElement: Function<T, MaybeNodeOrVNode>
): HtmlVNode => {
    const anchor = frag();

    anchor.registerSideEffect(
        buildUpdateAnchorSideEffect(anchor, getItems, buildElement)
    );

    return anchor;
};

const buildUpdateAnchorSideEffect = <T>(
    anchor: HtmlVElement,
    getItems: Supplier<IndexedItem<T>[]>,
    buildElement: Function<T, MaybeNodeOrVNode>
): () => void => {
    let currentItemOrder: string[] = [];
    let currentItemIndex: Map<string, MaybeNodeOrVNode> = new Map();

    return (): void => {
        const newItems: IndexedItem<T>[] = getItems();
        const newItemOrder: string[] = newItems.map(getKey);
        const newItemNodesIndex: Map<string, MaybeNodeOrVNode> = new Map(
            newItems.map((item: IndexedItem<T>): [string, MaybeNodeOrVNode] => [
                getKey(item),
                currentItemIndex.get(getKey(item)) ?? buildElement(getItem(item)),
            ]),
        );

        let firstNonEqualIndex: number = 0;
        while (firstNonEqualIndex < currentItemOrder.length &&
               firstNonEqualIndex < newItems.length &&
            currentItemOrder[firstNonEqualIndex] === newItemOrder[firstNonEqualIndex]) {
            ++firstNonEqualIndex;
        }

        anchor.deleteChildren(firstNonEqualIndex);
        anchor.appendChildren(
            newItemOrder
                .slice(firstNonEqualIndex)
                .map(key => newItemNodesIndex.get(key))
        );

        currentItemOrder = newItemOrder;
        currentItemIndex = newItemNodesIndex;
    };
};
