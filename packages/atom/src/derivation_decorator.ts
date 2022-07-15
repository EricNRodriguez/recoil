import {DerivedAtom} from "./atom.interface";
import {deriveState} from "./api";

export const derivation = (): string | any => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor): any => {
        const registry: WeakMap<Object, DerivedAtom<any>> = new WeakMap();
        const originalFn = descriptor.value;

        descriptor.value = function (...args: any[]): any {
            if (!registry.has(this)) {
                registry.set(
                    this,
                    deriveState({
                        deriveValue: () => {
                            return originalFn.apply(this, args);
                        },
                        autoScope: false,
                    }),
                );
            }
            return registry.get(this)!.get();
        };
    }
};
