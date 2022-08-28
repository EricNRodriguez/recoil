"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazy = void 0;
const lazy = (getModule) => {
    return async (...args) => {
        const module = await getModule();
        return module.default(...args);
    };
};
exports.lazy = lazy;
//# sourceMappingURL=lazy.js.map