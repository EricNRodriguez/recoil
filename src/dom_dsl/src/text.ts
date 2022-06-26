import {Atom, AtomFactory, buildFactory, isAtom} from "../../atom";
import {Supplier} from "./util.interface";
import {Reference} from "../../atom/src/factory.interface";

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

// a registry used to keep the effect in memory until the text node
// is gc'd, being the scope in which it is needed.
//
// this is important, as we are providing a reactive hook, rather than a callback,
// which means that there are no references other than that returned that refer to the
// effect strongly
//
// js weak maps are valid Ephemeron's, so there are no
// issues with values referring strongly to their keys
const sourceRefs: WeakMap<Text, BindedTextNodeSource> = new WeakMap();

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
        sourceRef = atomFactory.createEffect((): void => {
            textNode.textContent = source();
        });
    } else {
        // TODO(ericr): be more specific with a fall through
        throw new Error();
    }

    // bind the effect to the scope of the text node
    sourceRefs.set(textNode, sourceRef);

    return textNode;
};
