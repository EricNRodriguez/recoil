import { Producer } from "../../../utils";
import { WNode } from "../../../dom";
export declare type SupplyProps = {
    get: Producer<WNode<Node>>;
};
export declare const supply: (props: SupplyProps) => WNode<Node>;
