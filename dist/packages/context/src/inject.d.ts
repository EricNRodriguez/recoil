/**
 * A typesafe key for a symbol in the symbol table.
 */
export interface SymbolKey<T> extends Symbol {
}
export declare class SymbolTable {
    private readonly symbols;
    fork(): SymbolTable;
    set<T>(key: SymbolKey<T>, value: T): void;
    get<T>(key: SymbolKey<T>): T | undefined;
}
export declare class ExecutionScopeManager {
    private currentScope;
    getCurrentScope(): SymbolTable;
    /**
     * Decorates the provided function such that it runs in a child scope of the current scope at the time
     * of execution.
     *
     * @param fn The function to be decorated
     */
    withChildScope<Args extends unknown[], ReturnType>(fn: (...args: [...Args]) => ReturnType): (...args_0: Args) => ReturnType;
    /**
     * Decorates the provided function such that whenever the returned function is called, it executes the provided
     * function with the current scope at the time this function is called - i.e. it forms a closure over the current
     * scope at the time it is decorated.
     *
     * @param fn The function to be decorated.
     */
    withCurrentScope<Args extends unknown[], ReturnType>(fn: (...args: [...Args]) => ReturnType): (...args_0: Args) => ReturnType;
}
