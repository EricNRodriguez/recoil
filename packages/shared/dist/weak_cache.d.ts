import { Function } from "./function.interface";
export declare class WDerivationCache<K, V extends Object> {
  private readonly cache;
  private readonly deriveValue;
  constructor(deriveValue: Function<K, V>);
  get(key: K): V;
  private gc;
}
//# sourceMappingURL=weak_cache.d.ts.map
