export interface SideEffectRef {
  activate(): void;
  deactivate(): void;
}

export interface Atom<T> {
  get(): T;
  getUntracked(): T;
  invalidate(): void;
  react(effect: SideEffect<T>): SideEffectRef;
}

export interface LeafAtom<T> extends Atom<T> {
  set(value: T): void;
}

export interface DerivedAtom<T> extends Atom<T> {}

export interface SideEffect<T> {
  (value: T): void;
}
