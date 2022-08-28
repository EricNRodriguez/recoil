"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ = void 0;
const atom_1 = require("../../atom");
const dom_1 = require("../../dom");
const $ = (data) => {
    if ((0, atom_1.isAtom)(data)) {
        return (0, dom_1.createTextNode)(data.map((v) => v.toString()));
    }
    else if (typeof data === "function") {
        return (0, dom_1.createTextNode)((0, atom_1.deriveState)(() => data().toString()));
    }
    else {
        return (0, dom_1.createTextNode)(data.toString());
    }
};
exports.$ = $;
