import {NodeBuilder} from "./node_builder.interface";
import {Runnable} from "../../../atom/src/util.interface";

export interface ElementBuilder extends NodeBuilder{
    build(): Node;
    withClass(className: string): ElementBuilder;
    withId(id: string): ElementBuilder;
    withClickHandler(handler: Runnable): ElementBuilder;
    withChildren(...children: Element[]): ElementBuilder;
}