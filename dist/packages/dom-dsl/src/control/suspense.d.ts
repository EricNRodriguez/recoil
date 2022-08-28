import { WNode } from "dom";
export declare type SuspenseProps = {
    fallback?: WNode<Node>;
};
export declare const suspense: (props: SuspenseProps, child: Promise<WNode<Node>>) => WNode<Node>;
