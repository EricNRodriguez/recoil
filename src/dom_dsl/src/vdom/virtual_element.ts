import {BiConsumer, Consumer, Runnable} from "../../../atom/src/util.interface";
import {Attribute, VElement, ElementStyle} from "./virtual_element.interface";
import {Supplier} from "../util.interface";
import {Atom, runEffect, isAtom, Reference} from "../../../atom";
import {bindScope, replaceChildren} from "../util/dom_utils";
import {MaybeNode, MaybeNodeOrVNode} from "../node.interface";
import {t} from "../text";
import {Function} from "../util.interface";
import {a} from "../anchor";
import {unwrapVNode, wrapRawText} from "./vdom_util";
import {VNodeImpl} from "./virtual_node";
import {VNode} from "./virtual_node.interface";

export class VElementImpl implements VElement {
    private readonly children: VNode[] = [];
    private element: HTMLElement;

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

    public withAttribute(attribute: string, value: Attribute): VElement {
        if (isAtom(value)) {
            return this.withAtomicAttribute(attribute, value as Atom<string>);
        } else if (typeof value === "function") {
            return this.withSuppliedAttribute(attribute, value);
        } else if (typeof value === "string") {
            this.setAttribute(attribute, value);
            return this;
        }

        // TODO(ericr): replace with specific fall through error
        throw new Error("unsupported attribute type");
    }

    private setAttribute(attribute: string, value: string): void {
        this.element.setAttribute(attribute, value);
    }

    private withAtomicAttribute(attribute: string, value: Atom<string>): VElement {
        value.react((value: string): void => {
            this.setAttribute(attribute, value);
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
                    this.setAttribute(attribute, value);
                }
            }),
        );
        return this;
    }

    public withClickHandler(handler: Consumer<MouseEvent>): VElement {
        this.element.addEventListener("click", handler);
        return this;
    }

    public withEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): VElement {
        this.element.addEventListener(eventType, (event: Event): void => handler(event, this.element));
        return this;
    }

    public withChildren(...children: VNode[]): VElement {
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

    public withStyle(style: ElementStyle): VElement {
        Object.entries(style).forEach(([property, value]: [string, string]): void => {
           this.element.style.setProperty(property, value);
        });
        return this;
    }

    public map(fn: Function<HTMLElement, HTMLElement>): VElement {
        this.element = fn(this.element);
        return this;
    }

    public getRaw(): Element {
        return this.element;
    }
}