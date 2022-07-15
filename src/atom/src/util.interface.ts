export interface Producer<T> {
    (): T;
}

export interface AsyncProducer<T> {
    (): Promise<T>;
}

export interface Consumer<T> {
    (value: T): void;
}

export interface BiConsumer<A,B> {
    (a: A, b: B): void;
}

export interface Runnable {
    (): void;
}

export interface Function<I, O> {
    (value: I): O;
}

