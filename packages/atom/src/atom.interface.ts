import {Producer, Consumer, Runnable} from "./util.interface";

export interface Atom<T> {
    get(): T;
    kick(): void;
    react(effect: Consumer<T>): void;
}

export interface LeafAtom<T> extends Atom<T> {
    set(value: T): void;
}

export interface DerivedAtom<T> extends Atom<T> {}
