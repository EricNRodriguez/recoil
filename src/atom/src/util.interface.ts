export interface Producer<T> {
    (): T;
}

export interface Consumer<T> {
    (value: T): void;
}

export interface Runnable {
    (): void;
}

export interface Function<I, O> {
    (value: I): O;
}

