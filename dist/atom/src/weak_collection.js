"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeakCollection = void 0;
class WeakCollection {
    items = [];
    itemsSet = new WeakSet([]);
    getItems() {
        const items = [
            ...this.items
                .map((ref) => ref.deref())
                .filter((item) => item !== undefined)
                .map((item) => item),
        ];
        this.removeGCdItems();
        return items;
    }
    register(item) {
        if (this.itemsSet.has(item)) {
            return;
        }
        const ref = new WeakRef(item);
        this.itemsSet.add(item);
        this.items.push(ref);
    }
    deregister(item) {
        this.itemsSet.delete(item);
        this.items = this.items.filter((v) => v.deref() !== item);
    }
    reset() {
        this.items.forEach((ref) => {
            const item = ref.deref();
            if (item !== undefined) {
                this.itemsSet.delete(item);
            }
        });
        this.items = [];
    }
    forEach(consumer) {
        this.items.forEach((ref) => {
            const item = ref.deref();
            if (item !== undefined) {
                consumer(item);
            }
        });
        this.removeGCdItems();
    }
    removeGCdItems() {
        this.items = this.items.filter((ref) => ref.deref() !== undefined);
    }
}
exports.WeakCollection = WeakCollection;
//# sourceMappingURL=weak_collection.js.map