"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WDerivationCache = void 0;
const type_check_1 = require("./type_check");
class WDerivationCache {
    constructor(deriveValue) {
        this.cache = new Map();
        this.deriveValue = deriveValue;
    }
    get(key) {
        this.gc();
        const val = this.cache.get(key)?.deref();
        if ((0, type_check_1.notNullOrUndefined)(val)) {
            return val;
        }
        const newVal = this.deriveValue(key);
        this.cache.set(key, new WeakRef(newVal));
        return newVal;
    }
    gc() {
        for (let key of this.cache.keys()) {
            const valRef = this.cache.get(key);
            if (valRef.deref() === undefined) {
                this.cache.delete(key);
            }
        }
    }
}
exports.WDerivationCache = WDerivationCache;
