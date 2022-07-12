import {BiConsumer, Consumer} from "../../../atom/src/util.interface";
import {Attribute, VElement, ElementStyle} from "./virtual_element.interface";
import {Supplier} from "../util.interface";
import {Atom, runEffect, isAtom, SideEffectRef} from "../../../atom";
import {appendChildren, notNullOrUndefined, removeChildren, replaceChildren} from "../util/dom_utils";
import {isVNode, unwrapVNode} from "./vdom_util";
import {VNode} from "./virtual_node.interface";
import {VNodeBase} from "./virtual_node_base";
import {HtmlVNode} from "./virtual_node";
import {t} from "../text";

// A lightweight wrapper around a DOM element
export class HtmlVElement extends VNodeBase<HTMLElement, HtmlVElement> implements VElement<HTMLElement, HtmlVElement>, HtmlVNode {
    private readonly children: VNode<any, any>[] = [];

    constructor(element: string | HTMLElement) {
        super(
            (typeof element === "string") ?
                document.createElement(element) :
                element as HTMLElement
        );
    }

    public mount(): HtmlVElement {
        super.mount();

        this.children.forEach((child: VNode<any, any>): void => {
            child.mount();
        });

        return this;
    }

    public unmount(): HtmlVElement {
        super.unmount();

        this.children.forEach((child: VNode<any, any>): void => {
            child.unmount();
        });

        return this;
    }

    public setChildren(...children: (VNode<any, any> | Node | string | null | undefined)[]): HtmlVElement {
        this.children.forEach((oldChild: VNode<any, any>): VNode<any, any> => oldChild.unmount());

        const processedChildren: VNode<any, any>[] = children
            .filter(notNullOrUndefined)
            .map((child): VNode<any, any> => {
                if (typeof child === "string") {
                    return t(child as string);
                } else if (isVNode(child)) {
                    return child as VNode<any, any>;
                } else {
                    return new HtmlVNode(child as Node);
                }
            }).map((newChild: VNode<any, any>): VNode<any, any> => {
                return this.isMounted() ? newChild.mount() : newChild.unmount();
            });
        this.children.length = 0;
        this.children.push(
            ...processedChildren
        );

        replaceChildren(
            this.getRaw(),
            ...processedChildren.map(unwrapVNode),
        );

        return this;
    }

    public deleteChildren(offset: number): HtmlVElement {
        const childrenToRemove: Node[] = this.children.slice(offset)
            .map((child: VNode<any, any>): VNode<any, any> => child.unmount())
            .map((child: VNode<any, any>): Node => child.getRaw());

        removeChildren(
            this.getRaw(),
            childrenToRemove,
        );

        return this;
    }

    public appendChildren(children: (VNode<any, any> | Node | string | null | undefined)[]): HtmlVElement {
        const processedChildren: VNode<any, any>[] = children
            .filter(notNullOrUndefined)
            .map((child): VNode<any, any> => {
                if (typeof child === "string") {
                    return t(child as string);
                } else if (isVNode(child)) {
                    return child as VNode<any, any>;
                } else {
                    return new HtmlVNode(child as Node);
                }
            }).map((newChild: VNode<any, any>): VNode<any, any> => {
                return this.isMounted() ? newChild.mount() : newChild.unmount();
            });

        this.children.push(
            ...processedChildren
        );

        appendChildren(
            this.getRaw(),
            processedChildren.map(unwrapVNode),
        );

        return this;
    }

    public setAttribute(attribute: string, value: Attribute): HtmlVElement {
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

    private setStaticAttribute(attribute: string, value: string): HtmlVElement {
        this.getRaw().setAttribute(attribute, value);
        return this;
    }

    private setAtomicAttribute(attribute: string, value: Atom<string>): HtmlVElement {
        const ref: SideEffectRef = value.react((value: string): void => {
            this.setStaticAttribute(attribute, value);
        });
        this.registerEffect(ref);

        return this
    }

    private setSuppliedAttribute(attribute: string, valueSupplier: Supplier<string>): HtmlVElement {
        let currentAttributeValue: string;
        const ref: SideEffectRef = runEffect((): void => {
            const value: string = valueSupplier();
            if (value !== currentAttributeValue) {
                currentAttributeValue = value;
                this.setStaticAttribute(attribute, value);
            }
        });
        this.registerEffect(ref);

        return this;
    }

    public setClickHandler(handler: Consumer<MouseEvent>): HtmlVElement {
        this.getRaw().addEventListener("click", handler);
        return this;
    }

    public addEventHandler(eventType: string, handler: BiConsumer<Event, HTMLElement>): HtmlVElement {
        this.getRaw().addEventListener(eventType, (event: Event): void => handler(event, this.getRaw()));
        return this;
    }

    public setStyle(style: ElementStyle): HtmlVElement {
        Object.entries(style).forEach(([property, value]: [string, string]): void => {
           this.getRaw().style.setProperty(property, value);
        });
        return this;
    }
}