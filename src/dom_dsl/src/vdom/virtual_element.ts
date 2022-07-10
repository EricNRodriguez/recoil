import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {Attribute, VElement, ElementStyle} from "./virtual_element.interface";
import {Supplier} from "../util.interface";
import {Atom, runEffect, isAtom} from "../../../atom";
import {bindScope, replaceChildren} from "../util/dom_utils";
import {unwrapVNode} from "./vdom_util";
import {VNode} from "./virtual_node.interface";
import {EffectRegistry} from "./effect_context";

// A lightweight wrapper around a DOM element
export class VElementImpl implements VElement {
    private readonly element: HTMLElement;
    private readonly children: VNode[] = [];
    private readonly effects: EffectRegistry = new EffectRegistry();

    constructor(element: string | HTMLElement) {
        if (typeof element === "string") {
            this.element = document.createElement(element);
        } else {
            this.element = element;
        }
    }

    public mount() {
    }

    public unmount() {
    }

    public setAttribute(attribute: string, value: Attribute): VElement {
        if (isAtom(value)) {
            return this.withAtomicAttribute(attribute, value as Atom<string>);
        } else if (typeof value === "function") {
            return this.withSuppliedAttribute(attribute, value);
        } else if (typeof value === "string") {
            this.setAttributeOLD(attribute, value);
            return this;
        }

        // TODO(ericr): replace with specific fall through error
        throw new Error("unsupported attribute type");
    }

    private setAttributeOLD(attribute: string, value: string): void {
        this.element.setAttribute(attribute, value);
    }

    private withAtomicAttribute(attribute: string, value: Atom<string>): VElement {
        value.react((value: string): void => {
            this.setAttributeOLD(attribute, value);
        });
        return this
    }

    private withSuppliedAttribute(attribute: string, valueSupplier: Supplier<string>): VElement {
        let currentAttributeValue: string;
        bindScope(
            this.element,
            runEffect((): void => {
                const value: string = valueSupplier();
                if (value !== currentAttributeValue) {
                    currentAttributeValue = value;
                    this.setAttributeOLD(attribute, value);
                }
            }),
        );
        return this;
    }

    public setClickHandler(handler: Consumer<MouseEvent>): VElement {
        this.element.addEventListener("click", handler);
        return this;
    }

    public addEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): VElement {
        this.element.addEventListener(eventType, (event: Event): void => handler(event, this.element));
        return this;
    }

    public setChildren(...children: VNode[]): VElement {
        this.children.length = 0;
        this.children.push(
            ...children
        );

        replaceChildren(
            this.element,
            ...children.map(unwrapVNode<Node>),
        );

        return this;
    }

    public setStyle(style: ElementStyle): VElement {
        Object.entries(style).forEach(([property, value]: [string, string]): void => {
           this.element.style.setProperty(property, value);
        });
        return this;
    }

    public getRaw(): Element {
        return this.element;
    }
}