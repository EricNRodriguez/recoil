"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstNonEqualIndex = void 0;
const firstNonEqualIndex = (a, b) => {
    let firstNonEqualIndex = 0;
    while (firstNonEqualIndex < a.length &&
        firstNonEqualIndex < b.length &&
        a[firstNonEqualIndex] === b[firstNonEqualIndex]) {
        ++firstNonEqualIndex;
    }
    return firstNonEqualIndex;
};
exports.firstNonEqualIndex = firstNonEqualIndex;
