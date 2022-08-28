import { Supplier } from "utils";
import { IAtom } from "atom";
import { WNode } from "dom";
export declare type TextNodeTypes = string | boolean | number;
export declare type TextNodeSource = TextNodeTypes | Supplier<TextNodeTypes> | IAtom<TextNodeTypes>;
export declare const $: (data: TextNodeSource) => WNode<Node>;
