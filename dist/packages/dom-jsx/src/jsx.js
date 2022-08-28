"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsx = exports.Fragment = void 0;
const dom_dsl_1 = require("dom-dsl");
const dom_1 = require("dom");
exports.Fragment = Symbol();
const jsx = (tag, props, ...children) => {
    if (tag === exports.Fragment) {
        return (0, dom_dsl_1.frag)(...children);
    }
    if (typeof tag === "function") {
        return tag(props, ...children);
    }
    if (typeof tag !== "string") {
        // TODO(ericr): more specific type and message
        throw new Error("tag type not supported");
    }
    return (0, dom_1.createElement)(tag, props, [
        ...children,
    ]);
};
exports.jsx = jsx;
