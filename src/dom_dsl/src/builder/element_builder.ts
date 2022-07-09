import {BiConsumer, Consumer, Runnable} from "../../../atom/src/util.interface";
import {Attribute, ElementBuilder, ElementStyle} from "./element_builder.interface";
import {Supplier} from "../util.interface";
import {Atom, runEffect, isAtom, Reference} from "../../../atom";
import {bindScope} from "../dom_utils";
import {MaybeNode} from "../node.interface";
import {t} from "../text";
import {Function} from "../util.interface";
import {a} from "../anchor";

export class ElementBuilderImpl implements ElementBuilder {
    private element: HTMLElement;

    constructor(element: string | HTMLElement) {
        if (typeof element === "string") {
            this.element = document.createElement(element);
        } else {
            this.element = element;
        }
    }

    public withAttribute(attribute: string, value: Attribute): ElementBuilder {
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

    private withAtomicAttribute(attribute: string, value: Atom<string>): ElementBuilder {
        value.react((value: string): void => {
            this.setAttribute(attribute, value);
        });
        return this
    }

    private withSuppliedAttribute(attribute: string, valueSupplier: Supplier<string>): ElementBuilder {
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

    public withClickHandler(handler: Consumer<MouseEvent>): ElementBuilder {
        this.element.addEventListener("click", handler);
        return this;
    }

    public withEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): ElementBuilder {
        this.element.addEventListener(eventType, (event: Event): void => handler(event, this.element));
        return this;
    }

    public withChildren(...children: (MaybeNode | string)[]): ElementBuilder {
        this.element.replaceChildren(
            ...children
                .map((child: MaybeNode | string): MaybeNode => typeof child === "string" ? t(child) : child as MaybeNode)
                .filter((child: MaybeNode): boolean => child !== null && child !== undefined) as Node[]);
        return this;
    }

    public withStyle(style: ElementStyle): ElementBuilder {
        Object.entries(style).forEach(([property, value]: [string, string]): void => {
           this.element.style.setProperty(property, value);
        });
        return this;
    }

    public map(fn: Function<HTMLElement, HTMLElement>): ElementBuilder {
        this.element = fn(this.element);
        return this;
    }

    public build(): Element {
        return this.element;
    }
}