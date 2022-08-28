import { Supplier } from "../../../utils";
import { WNode } from "../../../dom";
import { Function } from "../../../utils";
export declare type IndexedItem<T> = [string, T];
export declare const getKey: <T>(item: IndexedItem<T>) => string;
export declare const getItem: <T>(item: IndexedItem<T>) => T;
export declare type ForEachProps<T> = {
    items: Supplier<IndexedItem<T>[]>;
    render: Function<T, WNode<Node>>;
};
export declare const forEach: <T extends Object>(props: ForEachProps<T>) => WNode<Node>;
//# sourceMappingURL=forEach.d.ts.map