export interface ISideEffectRef {
  activate(): void;
  deactivate(): void;
}

export interface IAtom<T> {
  get(): T;
  getUntracked(): T;
  invalidate(): void;
}

export interface ILeafAtom<T> extends IAtom<T> {
  set(value: T): void;
  update(fn: (val: T) => T): void;
}

export interface ISideEffect<T> {
  (value: T): void;
}
