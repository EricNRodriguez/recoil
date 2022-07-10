import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {Attribute, VElement, ElementStyle} from "./virtual_element.interface";
import {Supplier} from "../util.interface";
import {Atom, runEffect, isAtom, SideEffectRef} from "../../../atom";
import {bindScope, replaceChildren} from "../util/dom_utils";
import {unwrapVNode} from "./vdom_util";
import {VNode} from "./virtual_node.interface";
import {VNodeImpl} from "./virtual_node";

// A lightweight wrapper around a DOM element
export class VElementImpl extends VNodeImpl<HTMLElement, VElementImpl> implements VElement<HTMLElement, VElementImpl> {
    private readonly children: VNode<any, any>[] = [];

    constructor(element: string | HTMLElement) {
        super(
            (typeof element === "string") ?
                document.createElement(element) :
                element as HTMLElement
        );
    }

    public mount(): VElementImpl {
        super.mount();

        this.children.forEach((child: VNode<any, any>): void => {
            child.mount();
        });

        return this;
    }

    public unmount(): VElementImpl {
        super.unmount();

        this.children.forEach((child: VNode<any, any>): void => {
            child.unmount();
        });

        return this;
    }

    public setChildren(...children: VNode<any, any>[]): VElementImpl {
        this.children.length = 0;
        this.children.push(
            ...children
        );

        replaceChildren(
            this.getRaw(),
            ...children.map(unwrapVNode<Node>),
        );

        return this;
    }


    public setAttribute(attribute: string, value: Attribute): VElementImpl {
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

    private setStaticAttribute(attribute: string, value: string): VElementImpl {
        this.getRaw().setAttribute(attribute, value);
        return this;
    }

    private setAtomicAttribute(attribute: string, value: Atom<string>): VElementImpl {
        const ref: SideEffectRef = value.react((value: string): void => {
            this.setStaticAttribute(attribute, value);
        });
        this.registerEffect(ref);

        bindScope(this.getRaw(), ref);

        return this
    }

    private setSuppliedAttribute(attribute: string, valueSupplier: Supplier<string>): VElementImpl {
        let currentAttributeValue: string;
        const ref: SideEffectRef = runEffect((): void => {
            const value: string = valueSupplier();
            if (value !== currentAttributeValue) {
                currentAttributeValue = value;
                this.setStaticAttribute(attribute, value);
            }
        });
        this.registerEffect(ref);

        bindScope(this.getRaw(), ref);

        return this;
    }

    public setClickHandler(handler: Consumer<MouseEvent>): VElementImpl {
        this.getRaw().addEventListener("click", handler);
        return this;
    }

    public addEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): VElementImpl {
        this.getRaw().addEventListener(eventType, (event: Event): void => handler(event, this.getRaw()));
        return this;
    }

    public setStyle(style: ElementStyle): VElementImpl {
        Object.entries(style).forEach(([property, value]: [string, string]): void => {
           this.getRaw().style.setProperty(property, value);
        });
        return this;
    }
}