import {Runnable} from "../../../atom/src/util.interface";
import {ElementBuilder, ElementStyle} from "./element_builder.interface";
import {Supplier} from "../util.interface";
import {Atom, runEffect, isAtom, Reference} from "../../../atom";
import {bindScope} from "../dom_utils";
import {MaybeNode} from "../node.interface";
import {t} from "../text";

export class ElementBuilderImpl implements ElementBuilder {
    private readonly element: HTMLElement;

    constructor(tag: string) {
        this.element = document.createElement(tag);
    }

    public withClass(className: string | Atom<string> | Supplier<string>): ElementBuilder {
        if (typeof className === "string") {
            this.element.className = `${this.element.className} ${className}`;
        } else {
            const prevClassName = this.element.className;
            const effectRef: Reference = runEffect((): void => {
                const newClassName: string = isAtom(className) ?
                    (className as Atom<any>).get() :
                    (className as Supplier<string>)();

                this.element.className = `${prevClassName} ${newClassName}`;
            })
            bindScope(this.element, effectRef);
        }
        return this;
    }

    public withId(id: string): ElementBuilder {
        this.element.id = id;
        return this;
    }

    public withClickHandler(handler: Runnable): ElementBuilder {
        this.element.addEventListener("click", handler);
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


    public build(): Element {
        return this.element;
    }
}