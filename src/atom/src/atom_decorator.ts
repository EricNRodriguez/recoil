import {LeafAtom} from "./atom.interface";
import {createState} from "./api";

export const atom = (): void | any => {
    const registry: WeakMap<Object, LeafAtom<any>> = new WeakMap<Object, LeafAtom<any>>();

    return function (target: Object, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {
            set: function(this, newVal: any) {
                if (!registry.has(this)) {
                    registry.set(
                        this,
                        createState({
                            value: newVal,
                            autoScope: false,
                        }),
                    );
                } else {
                    registry.get(this)!.set(newVal);
                }
            },
            get: function(): any {
                return registry.get(this)!.get();
            }
        });
    };
};