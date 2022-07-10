import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {Attribute, VElement, ElementStyle} from "./virtual_element.interface";
import {Supplier} from "../util.interface";
import {Atom, runEffect, isAtom, SideEffectRef} from "../../../atom";
import {bindScope, replaceChildren} from "../util/dom_utils";
import {unwrapVNode} from "./vdom_util";
import {VNode} from "./virtual_node.interface";

// A lightweight wrapper around a DOM element
export class VElementImpl implements VElement {
    private readonly element: HTMLElement;
    private readonly children: VNode[] = [];
    private readonly rootEffects: Set<SideEffectRef> = new Set<SideEffectRef>();

    constructor(element: string | HTMLElement) {
        if (typeof element === "string") {
            this.element = document.createElement(element);
        } else {
            this.element = element;
        }
    }

    public mount() {
        this.activateEffects();
    }

    public unmount() {
        this.deactivateEffects();
    }

    private activateEffects(): void {
        this.rootEffects.forEach((ref: SideEffectRef): void => {
            ref.activate();
        });
    }

    private deactivateEffects(): void {
        this.rootEffects.forEach((ref: SideEffectRef): void => {
            ref.deactivate();
        });
    }

    public setAttribute(attribute: string, value: Attribute): VElement {
        if (isAtom(value)) {
            return this.setAtomicAttribute(attribute, value as Atom<string>);
        } else if (typeof value === "function") {
            return this.setSuppliedAttribute(attribute, value);
        } else if (typeof value === "string") {
            return this.setStaticAttribute(attribute, value);
        }

        // TODO(ericr): replace with specific fall through error
        throw new Error("unsupported attribute type");
    }

    private setStaticAttribute(attribute: string, value: string): VElement {
        this.element.setAttribute(attribute, value);
        return this;
    }

    private setAtomicAttribute(attribute: string, value: Atom<string>): VElement {
        value.react((value: string): void => {
            this.setStaticAttribute(attribute, value);
        });
        return this
    }

    private setSuppliedAttribute(attribute: string, valueSupplier: Supplier<string>): VElement {
        let currentAttributeValue: string;
        bindScope(
            this.element,
            runEffect((): void => {
                const value: string = valueSupplier();
                if (value !== currentAttributeValue) {
                    currentAttributeValue = value;
                    this.setStaticAttribute(attribute, value);
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