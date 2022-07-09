import {NodeBuilder} from "./node_builder.interface";
import {Consumer} from "../../../atom/src/util.interface";
import {MaybeNode} from "../node.interface";

export type ElementStyle = {[key: string]: string};

export interface ElementBuilder extends NodeBuilder{
    withEventHandler(eventType: string, handler: Consumer<Event>): ElementBuilder;
    withClickHandler(handler: Consumer<MouseEvent>): ElementBuilder;
    withAttribute(attribute: string, value: string): ElementBuilder;
    withChildren(...children: (MaybeNode | string)[]): ElementBuilder;
    withStyle(style: ElementStyle): ElementBuilder;
    build(): Element;
}