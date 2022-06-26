import {Atom, AtomFactory, buildFactory, isAtom} from "../../atom";
import {Supplier} from "./util.interface";

const atomFactory: AtomFactory = buildFactory();

export type TextContent = string | Supplier<string> | Atom<string>;

export const t = (content: TextContent): Text => {
    let textNode: Text;
    if (typeof content === "string") {
        textNode = document.createTextNode(content);
    } else if (isAtom(content) || typeof content === "function") {
        textNode = createBindedTextNode(content);
    } else {
        // TODO(ericr): be more specific with a fall through
        throw new Error();
    }

    return textNode;
};

// a registry used to keep the source in memory until the text node
// is free for garbage collection
//
// this is important, as we are providing a reactive hook, rather than a callback,
// which means that there are no references
const sourceRefs: WeakMap<Text, BindedTextNodeSource> = new WeakMap();

type BindedTextNodeSource = Supplier<string> | Atom<string>;

const createBindedTextNode = (source: BindedTextNodeSource): Text => {
    const textNode: Text = document.createTextNode("");

    if (isAtom(source)) {
        (source as Atom<string>).react((value: string): void => {
            textNode.textContent = value;
        });
    } else if (typeof source === "function") {
        atomFactory.createEffect((): void => {
            textNode.textContent = source();
        });
    } else {
        // TODO(ericr): be more specific with a fall through
        throw new Error();
    }

    sourceRefs.set(textNode, source);

    return textNode;
};
