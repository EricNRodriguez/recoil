const firstNonEqualIndex = (a, b) => {
    let firstNonEqualIndex = 0;
    while (firstNonEqualIndex < a.length &&
        firstNonEqualIndex < b.length &&
        a[firstNonEqualIndex] === b[firstNonEqualIndex]) {
        ++firstNonEqualIndex;
    }
    return firstNonEqualIndex;
};const clamp = (args) => {
    return Math.max(args.min ?? Number.NEGATIVE_INFINITY, Math.min(args.max ?? Number.POSITIVE_INFINITY, args.val));
};const removeNullAndUndefinedItems = (items) => {
    return items.filter((item) => item !== null && item !== undefined);
};
const nullOrUndefined = (item) => {
    return item === null || item === undefined;
};
const notNullOrUndefined = (item) => {
    return !nullOrUndefined(item);
};
const nonEmpty = (col) => {
    return col.length !== 0;
};const wrapStaticContentInProvider = (content) => {
    if (typeof content === "function") {
        return content;
    }
    else {
        return () => content;
    }
};class WDerivationCache {
    cache = new Map();
    deriveValue;
    constructor(deriveValue) {
        this.deriveValue = deriveValue;
    }
    get(key) {
        this.gc();
        const val = this.cache.get(key)?.deref();
        if (notNullOrUndefined(val)) {
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
}/**
 * A utility class that provides runtime decoration to exported functions, implemented as a singleton.
 */
class ApiFunctionBuilder {
    decoratorRegistry = new Map();
    baseFuncRegistry = new Map();
    /**
     * A higher order method that provides runtime decoration support to the injected function
     *
     * @param baseFunc The function wrapped by the return function
     * @returns A wrapper function around the injected function, which may be further decorated at runtime.
     */
    build(baseFunc) {
        const externalFunc = ((...args) => {
            return this.composeFunction(externalFunc)(...args);
        });
        this.decoratorRegistry.set(externalFunc, []);
        this.baseFuncRegistry.set(externalFunc, baseFunc);
        return externalFunc;
    }
    /**
     * Registers runtime decorators for methods constructed by the build method
     *
     * @param apiFn The method _returned_ by the build method (not the injected function!)
     * @param decorator The higher order function to wrap the apiFn
     */
    registerDecorator(apiFn, decorator) {
        if (!this.decoratorRegistry.has(apiFn)) {
            // TODO(ericr): more specific error type
            throw new Error("decorating the provided function is not supported");
        }
        this.decoratorRegistry.get(apiFn).push(decorator);
    }
    /**
     * Unregisters any runtime decorators injected via the registerDecorator method
     *
     * @param apiFn The method _returned_ by the build method (not the injected function!)
     * @param decorator The higher order decorator that is to be removed
     */
    deregisterDecorator(apiFn, decorator) {
        this.decoratorRegistry.set(apiFn, (this.decoratorRegistry.get(apiFn) ?? []).filter((dec) => dec !== decorator));
    }
    /**
     * Takes the external function and applies all registered decorators in FIFO order of registration, returning
     * the decorated function. This is done lazily at runtime to enable runtime decoration.
     *
     * @param externalFunc The method _returned_ by the build method
     * @returns The composed function, being the registered base function with all of the currently registered decorators
     *          applied.
     */
    composeFunction(externalFunc) {
        if (!this.baseFuncRegistry.has(externalFunc)) {
            // TODO(ericr): more specific message and type
            throw new Error("unable to compose unknown function");
        }
        const baseFunc = this.baseFuncRegistry.get(externalFunc);
        const decorations = this.decoratorRegistry.get(externalFunc);
        return decorations.reduceRight((composedFunc, decorator) => decorator(composedFunc), baseFunc);
    }
}export{ApiFunctionBuilder,WDerivationCache,clamp,firstNonEqualIndex,nonEmpty,notNullOrUndefined,nullOrUndefined,removeNullAndUndefinedItems,wrapStaticContentInProvider};//# sourceMappingURL=index.js.map
