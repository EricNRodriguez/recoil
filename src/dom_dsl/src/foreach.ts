import {Function, Supplier} from "./util.interface";
import {bindScope, replaceChildren} from "./dom_utils";
import {frag} from "./frag";
import {unwrapNodesFromBuilder} from "./builder/builder_util";
import {IndexedItem} from "./indexed_item.interface";
import {getItem, getKey} from "./indexed_item_lense";
import {runEffect} from "../../atom";
import {MaybeNode, MaybeNodeOrNodeBuilder} from "./node.interface";

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
    const currentlyRenderedItems: Map<string, MaybeNode> = new Map();

    return (): void => {
        const nextGenerationOfItems: IndexedItem<T>[] = getItems();

        const nextGenerationOfItemsIndex: Set<string> = new Set<string>(
            nextGenerationOfItems.map(getKey)
        );

        for (let itemKey of currentlyRenderedItems.keys()) {
            if (!nextGenerationOfItemsIndex.has(itemKey)) {
                currentlyRenderedItems.delete(itemKey);
            }
        }

        for (let indexedItem of nextGenerationOfItems) {
            if (!currentlyRenderedItems.has(getKey(indexedItem))) {
                currentlyRenderedItems.set(
                    getKey(indexedItem),
                    unwrapNodesFromBuilder(buildElement(getItem(indexedItem)))
                );
            }
        }

        const newItemSet = nextGenerationOfItems
            .map(getKey)
            .map(currentlyRenderedItems.get.bind(currentlyRenderedItems))
            .map(unwrapNodesFromBuilder<Node>);


        replaceChildren(
            anchor,
            ...newItemSet
        );
    };
};
