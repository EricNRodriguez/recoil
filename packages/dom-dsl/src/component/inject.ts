import {createState, ILeafAtom} from "../../../atom";

export interface InjectionKey<T> extends Symbol {}

// A store with tracked reads/writes
export class ScopedInjectionRegistry {
  private readonly symbols: Map<any, ILeafAtom<any>>[] = [new Map()];

  public static fork(parent: ScopedInjectionRegistry): ScopedInjectionRegistry {
      const child: ScopedInjectionRegistry = new ScopedInjectionRegistry();
      child.symbols.length = 0;
      child.symbols.push(...parent.symbols);
      return child;
  }

  public enterScope(): void {
    this.symbols.push(new Map());
  }

  public exitScope(): void {
    this.symbols.pop();
  }

  public set<T>(key: InjectionKey<T>, value: T): void {
    if (this.symbols[this.symbols.length-1].has(key)) {
      this.symbols[this.symbols.length-1].get(key)?.set(value);
    } else {
      this.symbols[this.symbols.length-1].set(key, createState(value));
    }
  }

  public get<T>(key: InjectionKey<T>): T | undefined {
    for (let i = this.symbols.length - 1; i >= 0; --i) {
      if (this.symbols[i].has(key)) {
        return this.symbols[i].get(key)?.get();
      }
    }

    return undefined;
  }
}
