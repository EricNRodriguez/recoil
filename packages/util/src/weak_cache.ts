import {Function} from "./function.interface";
import {notNullOrUndefined} from "./type_check";

export class WDerivationCache<K,V extends Object> {
  private readonly cache: Map<K, WeakRef<V>> = new Map();
  private readonly deriveValue: Function<K, V>;

  constructor(deriveValue: Function<K, V>) {
    this.deriveValue = deriveValue;
  }

  public get(key: K): V {
    this.gc();

    const val = this.cache.get(key)?.deref();
    if (notNullOrUndefined(val)) {
      return val!;
    }

    const newVal: V = this.deriveValue(key);
    this.cache.set(key, new WeakRef(newVal));
    return newVal;
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