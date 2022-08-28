"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = void 0;
const clamp = (args) => {
    return Math.max(args.min ?? Number.NEGATIVE_INFINITY, Math.min(args.max ?? Number.POSITIVE_INFINITY, args.val));
};
exports.clamp = clamp;
//# sourceMappingURL=math.js.map