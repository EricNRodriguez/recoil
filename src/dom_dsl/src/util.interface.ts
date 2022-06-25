export interface Supplier<T> {
    (): T;
}

export interface Function<I,O> {
    (input: I): O;
}