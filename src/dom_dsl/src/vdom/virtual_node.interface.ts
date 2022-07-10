export interface VNode {
    mount(): void;
    unmount(): void;
    getRaw(): Node;
}