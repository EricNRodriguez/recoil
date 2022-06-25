export interface Producer<T> {
    (): T;
}

export interface Consumer<T> {
    (value: T): void;
}

export interface Runnable {
    (): void;
}

