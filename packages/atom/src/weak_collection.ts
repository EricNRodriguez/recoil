import { Consumer } from "../../utils";

export class WeakCollection<T extends Object> {
  private items: WeakRef<T>[] = [];
  private itemsSet: WeakSet<T> = new WeakSet([]);

  public getItems(): T[] {
    const items = [
      ...this.items
        .map((ref: WeakRef<T>): T | undefined => ref.deref())
        .filter((item: T | undefined): boolean => item !== undefined)
        .map((item: T | undefined): T => item!),
    ];
    this.removeGCdItems();
    return items;
  }

  public register(item: T): void {
    if (this.itemsSet.has(item)) {
      return;
    }

    const ref: WeakRef<T> = new WeakRef<T>(item);
    this.itemsSet.add(item);
    this.items.push(ref);
  }

  public deregister(item: T): void {
    this.itemsSet.delete(item);
    this.items = this.items.filter((v) => v.deref() !== item);
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
    );
  }
}
