import { WNode } from "../../dom";
declare type DefaultModuleType = {
    default: (...args: any[]) => WNode<Node>;
};
export declare const lazy: (getModule: () => Promise<DefaultModuleType>) => (...args: any[]) => Promise<WNode<Node>>;
export {};
