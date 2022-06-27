import {Function, Supplier} from "./util.interface";
import {AtomFactory, buildFactory} from "../../atom";
import {bindScope, removeAllChildren} from "./dom_utils";
import {NodeBuilder} from "./builder/node_builder.interface";
import {unwrapNodesFromBuilder} from "./builder/builder_util";
import {Reference} from "../../atom/src/factory.interface";

const atomFactory: AtomFactory = buildFactory();

export const foreach = <T extends Object>(getItems: Supplier<T[]>, buildElement: Function<T, Node | NodeBuilder>): Node => {
    const elementCache: WeakMap<T, Node> = new WeakMap();

    const commentAnchor: Comment = document.createComment("foreach-anchor");
    const effectRef: Reference = atomFactory.createEffect((): void => {
        removeAllChildren(commentAnchor);

        getItems().forEach((item: T): void => {
            if (!elementCache.has(item)) {
                const builtItem: Node = unwrapNodesFromBuilder<Node>(buildElement(item)) as Node;
                elementCache.set(item, builtItem);
            }

            commentAnchor.appendChild(
                elementCache.get(item)!,
            );
        });
    });

    bindScope(commentAnchor, effectRef);
    return commentAnchor;
};