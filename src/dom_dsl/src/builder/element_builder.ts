import {NodeBuilder} from "./node_builder.interface";
import {Runnable} from "../../../atom/src/util.interface";
import {ElementBuilder} from "./element_builder.interface";

export class ElementBuilderImpl implements ElementBuilder {
    private readonly element: HTMLElement;

    constructor(tag: string) {
        this.element = document.createElement(tag);
    }

    public withClass(className: string): ElementBuilder {
        this.element.className = `${this.element.className} ${className}`;
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

    public withChildren(...children: Node[]): ElementBuilder {
        this.element.replaceChildren(...children);
        return this;
    }

    public build(): Node {
        return this.element;
    }
}