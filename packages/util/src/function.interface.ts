export interface Supplier<T> {
  (): T;
}

export interface Function<I, O> {
  (input: I): O;
}

export interface BiFunction<A,B,O> {
  (a: A, b: B): O;
}

export interface Method<T,I,O> {
  (this: T, input: I): O;
}

export interface Producer<T> {
  (): T;
}

export interface AsyncProducer<T> {
  (): Promise<T>;
}

export interface Consumer<T> {
  (value: T): void;
}

export interface BiConsumer<A, B> {
  (a: A, b: B): void;
}

export interface Runnable {
  (): void;
}

export interface Function<I, O> {
  (value: I): O;
}
