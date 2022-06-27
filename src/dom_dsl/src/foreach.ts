import {Function, Supplier} from "./util.interface";
import {AtomFactory, buildFactory} from "../../atom";
import {bindScope, removeAllChildren} from "./dom_utils";
import {NodeBuilder} from "./builder/node_builder.interface";
import {Reference} from "../../atom/src/factory.interface";

const atomFactory: AtomFactory = buildFactory();

export const foreach = <T extends Object>(getItems: Supplier<T[]>, buildElement: Function<T, Node | NodeBuilder>): Node => {
    const elementCache: WeakMap<T, Node | NodeBuilder> = new WeakMap();

    const anchor: HTMLElement = document.createElement("div");
    anchor.style.setProperty("display", "contents");

    const effectRef: Reference = atomFactory.createEffect((): void => {
        removeAllChildren(anchor);

        getItems().forEach((item: T): void => {
            let builtItem: Node | NodeBuilder | undefined = buildElement(item);
            anchor.appendChild(
                "build" in builtItem ? (builtItem as NodeBuilder).build() : builtItem,
            );

            // if (!elementCache.has(item)) {
            //     const builtItem: Node = unwrapNodesFromBuilder<Node>(buildElement(item)) as Node;
            //     // elementCache.set(item, builtItem);
            // }
            //
            // let builtItem: Node | NodeBuilder | undefined = elementCache.get(item);
            // if (builtItem === undefined) {
            //     return;
            // }
            // anchor.appendChild(
            //     "build" in builtItem ? (builtItem as NodeBuilder).build() : builtItem,
            // );
        });
    });

    bindScope(anchor, effectRef);
    bindScope(anchor, elementCache);
    return anchor;
};