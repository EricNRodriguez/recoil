import {NodeBuilder} from "./node_builder.interface";
import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {MaybeNode} from "../node.interface";
import {Supplier} from "../util.interface";
import {Atom} from "../../../atom";

export type ElementStyle = {[key: string]: string};

export type Attribute = string | Supplier<string> | Atom<string>;

export interface ElementBuilder extends NodeBuilder{
    withEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): ElementBuilder
    withClickHandler(handler: Consumer<MouseEvent>): ElementBuilder;
    withAttribute(attribute: string, value: Attribute): ElementBuilder;
    withChildren(...children: (MaybeNode | string)[]): ElementBuilder;
    withStyle(style: ElementStyle): ElementBuilder;
    build(): Element;
}