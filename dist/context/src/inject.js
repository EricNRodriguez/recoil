"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionScopeManager = exports.SymbolTable = void 0;
const atom_1 = require("../../atom");
class SymbolTable {
    symbols = [new Map()];
    fork() {
        const child = new SymbolTable();
        child.symbols.length = 0;
        child.symbols.push(...this.symbols, new Map());
        return child;
    }
    set(key, value) {
        if (this.symbols[this.symbols.length - 1].has(key)) {
            (0, atom_1.runUntracked)(() => this.symbols[this.symbols.length - 1].get(key)?.set(value));
        }
        else {
            this.symbols[this.symbols.length - 1].set(key, (0, atom_1.createState)(value));
        }
    }
    get(key) {
        for (let i = this.symbols.length - 1; i >= 0; --i) {
            if (this.symbols[i].has(key)) {
                return this.symbols[i].get(key)?.get();
            }
        }
        return undefined;
    }
}
exports.SymbolTable = SymbolTable;
class ExecutionScopeManager {
    currentScope = new SymbolTable();
    getCurrentScope() {
        return this.currentScope;
    }
    /**
     * Decorates the provided function such that it runs in a child scope of the current scope at the time
     * of execution.
     *
     * @param fn The function to be decorated
     */
    withChildScope(fn) {
        return (...args) => {
            const parentScope = this.currentScope;
            // At first sight it might seem unintuitive / stupid that we are forking instead of pushing a new scope, however
            // in order to make provide calls made inside callbacks that execute after a builder has returned work as
            // you would expect, we need to fork and never pop. This allows for the same 'scoped' behaviour, but also
            // allows callbacks to work intuitively.
            this.currentScope = this.currentScope.fork();
            try {
                return fn(...args);
            }
            finally {
                this.currentScope = parentScope;
            }
        };
    }
    /**
     * Decorates the provided function such that whenever the returned function is called, it executes the provided
     * function with the current scope at the time this function is called - i.e. it forms a closure over the current
     * scope at the time it is decorated.
     *
     * @param fn The function to be decorated.
     */
    withCurrentScope(fn) {
        const capturedScope = this.currentScope.fork();
        return (...args) => {
            const currentScope = this.currentScope;
            this.currentScope = capturedScope;
            try {
                return fn(...args);
            }
            finally {
                this.currentScope = currentScope;
            }
        };
    }
}
exports.ExecutionScopeManager = ExecutionScopeManager;
//# sourceMappingURL=inject.js.map