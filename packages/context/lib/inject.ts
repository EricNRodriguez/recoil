import { createState, runUntracked } from "../../atom";
import type { IMutableAtom } from "../../atom";

/**
 * A typesafe key for a symbol in the symbol table.
 */
export interface SymbolKey<T> extends Symbol {}

export class SymbolTable {
  private readonly symbols: Map<any, IMutableAtom<any>>[];

  constructor() {
    this.symbols = [new Map()];
  }

  public fork(): SymbolTable {
    const child: SymbolTable = new SymbolTable();
    child.symbols.length = 0;
    child.symbols.push(...this.symbols, new Map());
    return child;
  }

  public set<T>(key: SymbolKey<T>, value: T): void {
    if (this.symbols[this.symbols.length - 1].has(key)) {
      runUntracked(() =>
        this.symbols[this.symbols.length - 1].get(key)?.set(value)
      );
    } else {
      this.symbols[this.symbols.length - 1].set(key, createState(value));
    }
  }

  public get<T>(key: SymbolKey<T>): T | undefined {
    for (let i = this.symbols.length - 1; i >= 0; --i) {
      if (this.symbols[i].has(key)) {
        return this.symbols[i].get(key)?.get();
      }
    }

    return undefined;
  }
}

export class ExecutionScopeManager {
  private currentScope: SymbolTable = new SymbolTable();

  public getCurrentScope(): SymbolTable {
    return this.currentScope;
  }

  /**
   * Decorates the provided function such that it runs in a child scope of the current scope at the time
   * of execution.
   *
   * @param fn The function to be decorated
   */
  public withChildScope<Args extends unknown[], ReturnType>(
    fn: (...args: [...Args]) => ReturnType
  ) {
    return (...args: [...Args]): ReturnType => {
      const parentScope = this.currentScope;

      // At first sight it might seem unintuitive / stupid that we are forking instead of pushing a new scope, however
      // in order to make provide calls made inside callbacks that execute after a builder has returned work as
      // you would expect, we need to fork and never pop. This allows for the same 'scoped' behaviour, but also
      // allows callbacks to work intuitively.
      this.currentScope = this.currentScope.fork();

      try {
        return fn(...args);
      } finally {
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
  public withCurrentScope<Args extends unknown[], ReturnType>(
    fn: (...args: [...Args]) => ReturnType
  ) {
    const capturedScope = this.currentScope.fork();
    return (...args: [...Args]): ReturnType => {
      const currentScope = this.currentScope;
      this.currentScope = capturedScope;
      try {
        return fn(...args);
      } finally {
        this.currentScope = currentScope;
      }
    };
  }
}
