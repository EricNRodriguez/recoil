import {Atom, runEffect, Reference, isAtom, SideEffectRef} from "../../atom";
import {Supplier} from "./util.interface";
import {HtmlVNode} from "./vdom/virtual_node";

export type TextContent = string | Supplier<string> | Atom<string>;

export const t = (content: TextContent): HtmlVNode => {
    let textNode: HtmlVNode;
    if (typeof content === "string") {
        textNode = new HtmlVNode(document.createTextNode(content));
    } else if (isAtom(content) || typeof content === "function") {
        textNode = createBindedTextNode(content);
    } else {
        // TODO(ericr): be more specific with a fall through
        throw new Error();
    }

    return textNode;
};

type BindedTextNodeSource = Supplier<string> | Atom<string>;

const createBindedTextNode = (source: BindedTextNodeSource): HtmlVNode => {
    const textNode: Text = document.createTextNode("");

    let sourceRef: SideEffectRef;
    if (isAtom(source)) {
        sourceRef = (source as Atom<string>).react((value: string): void => {
            textNode.textContent = value;
        });
    } else if (typeof source === "function") {
        sourceRef = runEffect((): void => {
            textNode.textContent = source();
        });
    } else {
        // TODO(ericr): be more specific with a fall through
        throw new Error();
    }

    return new HtmlVNode(textNode)
        .registerEffect(sourceRef);
};
