import {Producer, Runnable} from "./util.interface";
import {LeafAtom, DerivedAtom} from "./atom.interface";

export type Reference = any;

export interface AtomFactory {
    buildAtom<T>(value: T): LeafAtom<T>;
    deriveAtom<T>(getValue: Producer<T>): DerivedAtom<T>;
    createEffect(effect: Runnable): Reference;
}