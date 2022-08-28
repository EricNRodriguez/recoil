import { IAtom } from "../../../atom";
import { Supplier } from "../../../utils";
import { WNode } from "../../../dom";
export declare type IfElseCondition = IAtom<boolean> | Supplier<boolean> | boolean;
export declare type IfElseContent = Supplier<WNode<Node>>;
export declare type IfElseProps = {
    condition: IfElseCondition;
    ifTrue: IfElseContent;
    ifFalse?: IfElseContent;
};
export declare const ifElse: (props: IfElseProps) => WNode<Node>;
