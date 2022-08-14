import {createState, ILeafAtom, runUntracked} from "../../../atom";

export interface InjectionKey<T> extends Symbol {}

export class InjectionRegistry {
  private readonly parentRegistry: InjectionRegistry | undefined;
  private readonly symbols: Map<any, ILeafAtom<any>> = new Map();

  constructor(parentRegistry?: InjectionRegistry) {
    this.parentRegistry = parentRegistry;
  }

  public  fork(): InjectionRegistry {
      return new InjectionRegistry(this);
  }

  public set<T>(key: InjectionKey<T>, value: T): void {
    if (this.symbols.has(key)) {
      runUntracked(() => this.symbols.get(key)?.set(value));
    } else {
     this.symbols.set(key, createState(value));
    }
  }

  public get<T>(key: InjectionKey<T>): T | undefined {
    return this.symbols.get(key)?.get() ?? this.parentRegistry?.get(key);
  }
}
