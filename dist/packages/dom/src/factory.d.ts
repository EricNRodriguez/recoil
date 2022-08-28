import { WElement } from "./element";
import { IAtom } from "../../atom";
import { WNode } from "./node";
declare type RawOrBinded<T> = IAtom<T> | T;
declare type Props = Record<string, RawOrBinded<any>>;
declare type Children = WNode<Node>[];
export declare const createElement: <K extends keyof HTMLElementTagNameMap>(tag: K | HTMLElementTagNameMap[K], props: Props, children: Children) => WElement<HTMLElementTagNameMap[K]>;
export declare const createTextNode: (text: RawOrBinded<string>) => WNode<Text>;
export declare const createFragment: (children: Children) => WNode<DocumentFragment>;
export {};
