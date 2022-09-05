import { Function } from "../../shared/function.interface";

export interface ISideEffectRef {
  activate(): void;
  deactivate(): void;
}

export interface IAtom<T> {
  get(): T;
  getUntracked(): T;
  invalidate(): void;
  map<R>(transform: Function<T, R>): IAtom<R>;
}

export interface IMutableAtom<T> extends IAtom<T> {
  set(value: T): void;
  update(fn: (val: T) => T): void;
}

export interface ISideEffect<T> {
  (value: T): void;
}
