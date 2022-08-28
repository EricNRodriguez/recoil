"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulSideEffectError = void 0;
class StatefulSideEffectError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "StatefulSideEffectError";
        this.stack = new Error().stack;
    }
}
exports.StatefulSideEffectError = StatefulSideEffectError;
