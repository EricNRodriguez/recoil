export interface Atom<T> {
    get(): T;
    getUntracked(): T;
    kick(): void;
    react(effect: SideEffect<T>): void;
}

export interface LeafAtom<T> extends Atom<T> {
    set(value: T): void;
}

export interface DerivedAtom<T> extends Atom<T> {}

export interface SideEffect<T> {
    (value: T): void;
}