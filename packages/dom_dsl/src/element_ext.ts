declare interface Element {
    withClassName(className: string): Element;
}

Element.prototype.withClassName = function(this: Element, className: string): Element {
    this.className = className;
    return this;
};