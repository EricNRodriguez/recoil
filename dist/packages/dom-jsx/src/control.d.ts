import { Function, Producer, Supplier } from "../../utils";
import { IndexedItem } from "../../dom-dsl";
import { IAtom } from "../../atom";
import { WNode } from "../../dom";
import { Component } from "./jsx";
export declare type SupplyProps = {
    getChild: Producer<WNode<Node>>;
};
export declare const Supply: Component<SupplyProps, [], WNode<Node>>;
export declare type ForProps<T> = {
    items: Supplier<IndexedItem<T>[]>;
    render: Function<T, WNode<Node>>;
};
export declare const For: <T extends Object>(props: ForProps<T>) => WNode<Node>;
export declare type IfProps = {
    condition: boolean | IAtom<boolean>;
    true: Supplier<WNode<Node>>;
    false?: Supplier<WNode<Node>>;
};
export declare const If: (props: IfProps) => WNode<Node>;
export declare type SwitchProps<T> = {
    value: IAtom<T>;
    cases: [T, Supplier<WNode<Node>>][];
    default?: Supplier<WNode<Node>>;
};
export declare const Switch: <T extends Object>(props: SwitchProps<T>) => WNode<Node>;
export declare type SuspenseProps = {
    default?: WNode<Node>;
};
export declare const Suspense: (props: SuspenseProps, ...children: Promise<WNode<Node>>[]) => WNode<Node>;
