import { WNode } from "dom";
/**
 * A strict definition for all custom jsx components to adhere to.
 */
export declare type Component<Props extends Object, Children extends WNode<Node>[], ReturnNode extends WNode<Node>> = (props: Props, ...children: [...Children]) => ReturnNode;
export declare const Fragment: unique symbol;
export declare const jsx: (tag: string | Component<Object, WNode<Node>[], WNode<Node>> | Symbol, props: Object, ...children: WNode<Node>[]) => WNode<Node>;
