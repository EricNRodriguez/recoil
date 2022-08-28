import { Consumer } from "../../utils";
export declare class WeakCollection<T extends Object> {
    private items;
    private itemsSet;
    getItems(): T[];
    register(item: T): void;
    deregister(item: T): void;
    reset(): void;
    forEach(consumer: Consumer<T>): void;
    private removeGCdItems;
}
