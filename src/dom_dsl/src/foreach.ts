import {Function, Supplier} from "./util.interface";
import {AtomFactory, buildFactory} from "../../atom";
import {bindScope, removeNullAndUndefinedItems, replaceChildren} from "./dom_utils";
import {NodeBuilder} from "./builder/node_builder.interface";
import {Reference} from "../../atom/src/factory.interface";
import {frag} from "./frag";
import {unwrapNodesFromBuilder} from "./builder/builder_util";

const atomFactory: AtomFactory = buildFactory();

export const foreach = <T extends Object>(getItems: Supplier<T[]>, buildElement: Function<T, Node | NodeBuilder>): Node => {
    const anchor = frag();

    const currentlyRenderedItems: Map<T, Node | undefined | null> = new Map();

    const effectRef: Reference = atomFactory.createEffect((): void => {
        const nextGenerationOfItems: T[] = getItems();

        const nextGenerationOfItemsIndex: Set<T> = new Set<T>(nextGenerationOfItems);
        for (let item of currentlyRenderedItems.keys()) {
            if (!nextGenerationOfItemsIndex.has(item)) {
                currentlyRenderedItems.delete(item);
            }
        }

        for (let item of nextGenerationOfItems) {
            if (!currentlyRenderedItems.has(item)) {
                currentlyRenderedItems.set(
                    item,
                    unwrapNodesFromBuilder(buildElement(item))
                );
            }
        }

        const newItemSet = nextGenerationOfItems
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