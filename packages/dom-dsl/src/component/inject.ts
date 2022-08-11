import {WeakCollection} from "../../../atom/src/weak_collection";
import {notNullOrUndefined} from "../../../util";
import {p} from "../element";

export interface InjectionKey<T> extends Symbol {}

export class ScopedInjectionRegistry {
  private readonly symbols: Map<any, any>[] = [new Map()];
  private readonly parent: ScopedInjectionRegistry | undefined;

  constructor(parent: ScopedInjectionRegistry | undefined) {
    this.parent = parent;
  }

  public fork(): ScopedInjectionRegistry {
    return new ScopedInjectionRegistry(this);
  }

  public enterScope(): void {
    this.symbols.push(new Map());
  }

  public exitScope(): void {
    this.symbols.pop();
  }

  public set<T>(key: InjectionKey<T>, value: T): void {
    this.symbols[this.symbols.length - 1].set(key, value);
    this.parent?.set(key, value);
  }

  public get<T>(key: InjectionKey<T>): T | undefined {
    for (let i = this.symbols.length - 1; i >= 0; --i) {
      if (this.symbols[i].has(key)) {
        return this.symbols[i].get(key);
      }
    }

    return this.parent?.get(key);
  }
}
