import {NodeBuilder} from "./node_builder.interface";
import {Consumer, Runnable} from "../../../atom/src/util.interface";
import {Atom} from "../../../atom";
import {Function, Supplier} from "../util.interface";
import {MaybeNode} from "../node.interface";

export type ElementStyle = {[key: string]: string};

export interface ElementBuilder extends NodeBuilder{
    withClass(className: string | Atom<string> | Supplier<string>): ElementBuilder;
    withId(id: string): ElementBuilder;
    withClickHandler(handler: Consumer<MouseEvent>): ElementBuilder;
    withAttribute(attribute: string, value: string): ElementBuilder;
    withChildren(...children: (MaybeNode | string)[]): ElementBuilder;
    withTitle(title: string): ElementBuilder;
    withStyle(style: ElementStyle): ElementBuilder;
    withBindedDependant(object: Object): ElementBuilder;
    build(): Element;
}