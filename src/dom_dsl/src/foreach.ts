import {Function, Supplier} from "./util.interface";
import {AtomFactory, buildFactory} from "../../atom";
import {bindScope, removeNullAndUndefinedItems, replaceChildren, removeAllChildren} from "./dom_utils";
import {NodeBuilder} from "./builder/node_builder.interface";
import {Reference} from "../../atom/src/factory.interface";
import {frag} from "./frag";
import {unwrapNodesFromBuilder} from "./builder/builder_util";

const atomFactory: AtomFactory = buildFactory();

// key value pair used for efficient indexing of existing built elements
export type IndexedItem<T> = [string, T];

// utility lenses for unboxing index and item from an IndexedItem
const getKey = <T>(item: IndexedItem<T>): string => item[0];
const getItem = <T>(item: IndexedItem<T>): T => item[1];

export const foreach = <T extends Object>(getItems: Supplier<IndexedItem<T>[]>, buildElement: Function<T, Node | NodeBuilder>): Node => {
    const anchor = frag();

    const currentlyRenderedItems: Map<string, Node | undefined | null> = new Map();

    const effectRef: Reference = atomFactory.createEffect((): void => {
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
    });

    bindScope(anchor, effectRef);
    return anchor;
};