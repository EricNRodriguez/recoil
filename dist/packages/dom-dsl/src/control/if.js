"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ifElse = void 0;
const atom_1 = require("atom");
const utils_1 = require("utils");
const dom_1 = require("dom");
const nullOrUndefinedNode = new dom_1.WNode(document.createComment("null"));
const ifElse = (props) => {
    let { condition, ifTrue, ifFalse } = props;
    ifFalse ??= () => nullOrUndefinedNode;
    if (typeof condition === "boolean") {
        return staticIfElse(condition, ifTrue, ifFalse);
    }
    const cache = new utils_1.WDerivationCache((value) => (value ? ifTrue() : ifFalse()));
    const anchor = (0, dom_1.createFragment)([]);
    let currentRenderedState;
    let currentRenderedSubtree = nullOrUndefinedNode;
    const ref = (0, atom_1.runEffect)(() => {
        const state = (0, atom_1.isAtom)(condition)
            ? condition.get()
            : condition();
        if (state === currentRenderedState) {
            return;
        }
        currentRenderedState = state;
        currentRenderedSubtree = cache.get(state);
        anchor.setChildren([
            currentRenderedSubtree === nullOrUndefinedNode
                ? null
                : currentRenderedSubtree,
        ]);
    });
    anchor.registerOnUnmountHook(() => ref.deactivate());
    anchor.registerOnMountHook(() => ref.activate());
    return anchor;
};
exports.ifElse = ifElse;
const staticIfElse = (condition, ifTrue, ifFalse) => {
    const anchor = (0, dom_1.createFragment)([]);
    anchor.setChildren([condition ? ifTrue() : ifFalse()].filter((c) => c !== nullOrUndefinedNode));
    return anchor;
};
