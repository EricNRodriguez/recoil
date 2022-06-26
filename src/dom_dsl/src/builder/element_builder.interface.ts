import {NodeBuilder} from "./node_builder.interface";
import {Runnable} from "../../../atom/src/util.interface";
import {Atom} from "../../../atom";
import {Supplier} from "../util.interface";

export interface ElementBuilder extends NodeBuilder{
    build(): Node;
    withClass(className: string | Atom<string> | Supplier<string>): ElementBuilder;
    withId(id: string): ElementBuilder;
    withClickHandler(handler: Runnable): ElementBuilder;
    withChildren(...children: (Node | null | undefined)[]): ElementBuilder;
}