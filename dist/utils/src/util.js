"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapStaticContentInProvider = void 0;
const wrapStaticContentInProvider = (content) => {
    if (typeof content === "function") {
        return content;
    }
    else {
        return () => content;
    }
};
exports.wrapStaticContentInProvider = wrapStaticContentInProvider;
//# sourceMappingURL=util.js.map