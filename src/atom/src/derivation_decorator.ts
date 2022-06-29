import {DerivedAtom} from "./atom.interface";
import {buildFactory} from "./factory";

export const derivation = (): string | any => {
    return (target: Object, propertyKey: string, descriptor: PropertyDescriptor): any => {
        const registry: WeakMap<Object, DerivedAtom<any>> = new WeakMap();
        const originalFn = descriptor.value;

        descriptor.value = function (...args: any[]): any {
            if (!registry.has(this)) {
                registry.set(
                    this,
                    buildFactory().deriveAtom(
                        () => {
                            return originalFn.apply(this, args);
                        },
                    ),
                );
            }
            return registry.get(this)!.get();
        };
    }
};
