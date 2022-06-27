import {ElementBuilder} from "./builder/element_builder.interface";
import {unwrapNodesFromBuilder} from "./builder/builder_util";

export const runApp = (anchor: Element, app: Element | ElementBuilder): void => {
    anchor.replaceChildren(unwrapNodesFromBuilder<Element>(app) as Node);
};