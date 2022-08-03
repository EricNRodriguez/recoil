import {Function} from "./function.interface";

export class WDerivationCache<K,V extends Object> {
  private readonly cache: Map<K, WeakRef<V>> = new Map();
  private readonly deriveValue: Function<K, V>;

  constructor(deriveValue: Function<K, V>) {
    this.deriveValue = deriveValue;
  }

  public get(key: K): V {
    this.gc();

    if (!this.cache.has(key)) {
      const val: V = this.deriveValue(key);
      this.cache.set(key, new WeakRef(val));
      return val;
    }

    return this.get(key);
  }

  private gc() {
    for (let key of this.cache.keys()) {
      const valRef = this.cache.get(key)!;
      if (valRef.deref() === undefined) {
        this.cache.delete(key);
      }
    }
  }

}