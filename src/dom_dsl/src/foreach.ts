import {Function, Supplier} from "./util.interface";
import {AtomFactory, buildFactory} from "../../atom";
import {removeAllChildren} from "./dom_utils";

const atomFactory: AtomFactory = buildFactory();

export const foreach = <T extends Object>(getItems: Supplier<T[]>, buildElement: Function<T, Node>): Node => {
    const elementCache: WeakMap<T, Node> = new WeakMap();

    const commentAnchor: Comment = document.createComment("foreach-anchor");
    atomFactory.createEffect((): void => {
        removeAllChildren(commentAnchor);

        getItems().forEach((item: T): void => {
            if (!elementCache.has(item)) {
                elementCache.set(item, buildElement(item));
            }

            commentAnchor.appendChild(
                elementCache.get(item)!,
            );
        });
    });

    return commentAnchor;
};