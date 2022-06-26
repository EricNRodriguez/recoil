import {Consumer} from "./util.interface";

export class WeakCollection<T extends Object> {
    private items: WeakRef<T>[] = [];
    private itemsSet: WeakSet<T> = new WeakSet([]);

    public getItems(): WeakRef<T>[] {
        return [...this.items];
    }

    public register(item: T): void {
        if (this.itemsSet.has(item)) {
            return;
        }

        const ref: WeakRef<T> = new WeakRef<T>(item);
        this.itemsSet.add(item);
        this.items.push(ref);
    }

    public reset() {
        this.items.forEach((ref: WeakRef<T>): void => {
            const item: T | undefined = ref.deref();
            if (item !== undefined) {
                this.itemsSet.delete(item);
            }
        });
        this.items = [];
    }

    public forEach(consumer: Consumer<T>): void {
        this.items.forEach((ref: WeakRef<T>): void => {
            const item: T | undefined = ref.deref();
            if (item !== undefined) {
                consumer(item);
            }
        });
        this.removeGCdItems();
    }

    private removeGCdItems(): void {
        this.items = this.items.filter(
            (ref: WeakRef<T>) => ref.deref() !== undefined
        )
    }
}