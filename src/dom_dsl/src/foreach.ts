import {Function, Supplier} from "./util.interface";
import {AtomFactory, buildFactory} from "../../atom";
import {removeAllChildren} from "./dom_utils";
import {NodeBuilder} from "./builder/node_builder.interface";
import {isNodeBuilder, unwrapNodesFromBuilder} from "./builder/builder_util";

const atomFactory: AtomFactory = buildFactory();

export const foreach = <T extends Object>(getItems: Supplier<T[]>, buildElement: Function<T, Node | NodeBuilder>): Node => {
    const elementCache: WeakMap<T, Node> = new WeakMap();

    const commentAnchor: Comment = document.createComment("foreach-anchor");
    atomFactory.createEffect((): void => {
        removeAllChildren(commentAnchor);

        getItems().forEach((item: T): void => {
            if (!elementCache.has(item)) {
                const builtItem: Node = unwrapNodesFromBuilder<Node>(buildElement(item));
                elementCache.set(item, builtItem);
            }

            commentAnchor.appendChild(
                elementCache.get(item)!,
            );
        });
    });

    return commentAnchor;
};