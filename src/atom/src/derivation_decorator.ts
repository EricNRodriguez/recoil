import {DerivedAtom} from "./atom.interface";
import {buildFactory} from "./factory";

export const derivation = (): string | any => {
    const registry: WeakMap<Object, DerivedAtom<any>> = new WeakMap();

    return function (this: Object, target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!registry.has(this)) {
            registry.set(
                this,
                buildFactory().deriveAtom(descriptor.value),
            );
        }

        return registry.get(this)!.get();
    };
};