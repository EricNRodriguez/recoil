import { Runnable } from "utils";
export declare abstract class BaseWNode<A extends Node, B extends BaseWNode<A, B>> {
    private parent;
    private readonly node;
    private readonly isDocumentFragment;
    private readonly children;
    private readonly onMountHooks;
    private readonly onUnmountHooks;
    private currentlyMounted;
    protected constructor(node: A);
    private isFragment;
    setProperty<T>(prop: string, value: T): B;
    private getUnpackedChildren;
    getChildren(): WNode<Node>[];
    private rebindChildren;
    setChildren(children: (WNode<Node> | Node | null | undefined)[]): B;
    syncMountStatusOfChild(child: WNode<Node>): void;
    isMounted(): boolean;
    private setParent;
    getParent(): WNode<Node> | null;
    mount(): B;
    unmount(): B;
    private runUnmountHooks;
    private runMountHooks;
    registerOnMountHook(hook: Runnable): B;
    registerOnUnmountHook(hook: Runnable): B;
    unwrap(): A;
}
export declare class WNode<T extends Node> extends BaseWNode<T, WNode<T>> {
    constructor(node: T);
}
export declare const isWNode: (content: any) => boolean;
export declare const unwrapVNode: (content: Node | WNode<Node>) => Node;
export declare const wrapInVNode: (node: WNode<Node> | Node | string | null | undefined) => WNode<Node> | null | undefined;
