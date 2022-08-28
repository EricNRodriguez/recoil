"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suspense = void 0;
const dom_1 = require("dom");
const utils_1 = require("utils");
const suspense = (props, child) => {
    const anchor = (0, dom_1.createFragment)([]);
    if ((0, utils_1.notNullOrUndefined)(props.fallback)) {
        anchor.setChildren([props.fallback]);
    }
    child.then((c) => anchor.setChildren([c]));
    return anchor;
};
exports.suspense = suspense;
