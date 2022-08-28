import { IAtom } from "atom";
import { WNode } from "dom";
import { Function } from "utils";
export declare type MatchProps<T> = {
    state: IAtom<T>;
    render: Function<T, WNode<Node>>;
};
export declare const match: <T extends Object>(props: MatchProps<T>) => WNode<Node>;
