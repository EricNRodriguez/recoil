declare interface Element {
    withClassName(className: string): Element;
    withId(id: string): Element;
}

Element.prototype.withClassName = function(this: Element, className: string): Element {
    this.className = className;
    return this;
};

Element.prototype.withId = function (this: Element, id: string): Element {
    this.id = id;
    return this;
};