import {LeafAtom} from "./atom.interface";
import {buildFactory} from "./factory";

export const atom = (): void | any => {
    const registry: WeakMap<Object, LeafAtom<any>> = new WeakMap<Object, LeafAtom<any>>();

    return (target: Object, propertyKey: string)  => {
        Object.defineProperty(target, propertyKey, {
            set: function(this, newVal: any) {
                if (!registry.has(this)) {
                    registry.set(
                        this,
                        buildFactory().buildAtom(newVal)
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