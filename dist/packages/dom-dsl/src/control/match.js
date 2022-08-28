"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = void 0;
const atom_1 = require("atom");
const dom_1 = require("dom");
const utils_1 = require("utils");
const match = (props) => {
    let { state, render } = props;
    const anchor = (0, dom_1.createFragment)([]);
    const matchCache = new utils_1.WDerivationCache(render);
    let prevState;
    const ref = (0, atom_1.runEffect)(() => {
        if (prevState === state.get()) {
            return;
        }
        prevState = state.get();
        const content = matchCache.get(prevState);
        anchor.setChildren([content]);
    });
    anchor.registerOnMountHook(() => ref.activate());
    anchor.registerOnUnmountHook(() => ref.deactivate());
    return anchor;
};
exports.match = match;
