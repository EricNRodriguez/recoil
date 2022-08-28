"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WElement = exports.BaseWElement = void 0;
const node_1 = require("./node");
class BaseWElement extends node_1.BaseWNode {
    eventCoordinator;
    constructor(element, eventCoordinator) {
        super(element);
        this.eventCoordinator = eventCoordinator;
    }
    setAttribute(attribute, value) {
        this.unwrap().setAttribute(attribute, value);
        return this;
    }
    setEventHandler(type, listener, delegate = false) {
        if (delegate) {
            this.eventCoordinator.attachEventHandler(type, this.unwrap(), listener);
        }
        else {
            this.unwrap().addEventListener(type, listener);
        }
        return this;
    }
}
exports.BaseWElement = BaseWElement;
class WElement extends BaseWElement {
    constructor(elem, eventCoordinator) {
        super(elem, eventCoordinator);
    }
}
exports.WElement = WElement;
//# sourceMappingURL=element.js.map