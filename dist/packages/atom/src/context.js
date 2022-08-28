"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomTrackingContext = void 0;
const typescript_monads_1 = require("typescript-monads");
class AtomTrackingContext {
    constructor() {
        this.scopeStack = [[]];
    }
    getCurrentScope() {
        return this.scopeStack[this.scopeStack.length - 1];
    }
    getCurrentParent() {
        const currentScope = this.getCurrentScope();
        if (currentScope.length === 0) {
            return typescript_monads_1.Maybe.none();
        }
        return typescript_monads_1.Maybe.some(currentScope[currentScope.length - 1]);
    }
    pushParent(derivation) {
        this.getCurrentScope().push(derivation);
    }
    popParent() {
        this.getCurrentScope().pop();
    }
    enterNewTrackingContext() {
        this.scopeStack.push([]);
    }
    exitCurrentTrackingContext() {
        if (this.scopeStack.length === 1) {
            // TODO(ericr): more clear message and type
            throw new Error("unable to exit the base context");
        }
        this.scopeStack.pop();
    }
}
exports.AtomTrackingContext = AtomTrackingContext;
