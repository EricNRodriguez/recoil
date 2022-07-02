import {unwrapNodesFromBuilder} from "./builder/builder_util";
import {NodeBuilder} from "./builder/node_builder.interface";

export const runApp = (anchor: Element, app: Node | NodeBuilder): void => {
    anchor.replaceChildren(unwrapNodesFromBuilder<Node>(app) as Node);
};