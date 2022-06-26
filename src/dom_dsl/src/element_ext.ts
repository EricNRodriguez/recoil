interface ClickHandler {
    (): void;
}

declare interface Element {
    withClassName(className: string): Element;
    withId(id: string): Element;
    withClickHandler(callback: ClickHandler): Element;
}

Element.prototype.withClassName = function(this: Element, className: string): Element {
    this.className = className;
    return this;
};

Element.prototype.withId = function (this: Element, id: string): Element {
    this.id = id;
    return this;
};

Element.prototype.withClickHandler = function (this: Element, callback: ClickHandler): Element {
    if (!(this instanceof HTMLElement)) {
        throw new Error("withClickHandler called on element that is not clickable");
    }
    (this as HTMLElement).addEventListener("click", callback);
    return this;
};
