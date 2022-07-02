import {NodeBuilder} from "./node_builder.interface";
import {Runnable} from "../../../atom/src/util.interface";
import {Atom} from "../../../atom";
import {Supplier} from "../util.interface";
import {MaybeNode} from "../node.interface";

export type ElementStyle = {[key: string]: string};

export interface ElementBuilder extends NodeBuilder{
    build(): Element;
    withClass(className: string | Atom<string> | Supplier<string>): ElementBuilder;
    withId(id: string): ElementBuilder;
    withClickHandler(handler: Runnable): ElementBuilder;
    withAttribute(attribute: string, value: string): ElementBuilder;
    withChildren(...children: (MaybeNode | string)[]): ElementBuilder;
    withTitle(title: string): ElementBuilder;
    withStyle(style: ElementStyle): ElementBuilder;
}