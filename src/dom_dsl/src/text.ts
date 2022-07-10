import {Atom, runEffect, Reference, isAtom} from "../../atom";
import {Supplier} from "./util.interface";
import {bindScope} from "./util/dom_utils";
import {HtmlVNode} from "./vdom/virtual_node";
import {VNode} from "./vdom/virtual_node.interface";

export type TextContent = string | Supplier<string> | Atom<string>;

export const t = (content: TextContent): VNode => {
    let textNode: Text;
    if (typeof content === "string") {
        textNode = document.createTextNode(content);
    } else if (isAtom(content) || typeof content === "function") {
        textNode = createBindedTextNode(content);
    } else {
        // TODO(ericr): be more specific with a fall through
        throw new Error();
    }

    return new HtmlVNode(textNode);
};

type BindedTextNodeSource = Supplier<string> | Atom<string>;

const createBindedTextNode = (source: BindedTextNodeSource): Text => {
    const textNode: Text = document.createTextNode("");

    let sourceRef: Reference = null;
    if (isAtom(source)) {
        (source as Atom<string>).react((value: string): void => {
            textNode.textContent = value;
        });
        sourceRef = source;
    } else if (typeof source === "function") {
        sourceRef = runEffect((): void => {
            textNode.textContent = source();
        });
    } else {
        // TODO(ericr): be more specific with a fall through
        throw new Error();
    }

    // bind the effect to the scope of the text node
    bindScope(textNode, sourceRef);

    return textNode;
};
