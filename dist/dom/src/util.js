"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapTextInWNode = void 0;
const factory_1 = require("./factory");
const wrapTextInWNode = (content) => {
    if (typeof content === "string") {
        return (0, factory_1.createTextNode)(content);
    }
    else {
        return content;
    }
};
exports.wrapTextInWNode = wrapTextInWNode;
//# sourceMappingURL=util.js.map