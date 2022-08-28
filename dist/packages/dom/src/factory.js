"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFragment = exports.createTextNode = exports.createElement = void 0;
const element_1 = require("./element");
const atom_1 = require("../../atom");
const node_1 = require("./node");
const event_1 = require("./event");
const globalEventCoordinator = new event_1.GlobalEventCoordinator();
const createElement = (tag, props, children) => {
    const node = new element_1.WElement(tag instanceof HTMLElement ? tag : document.createElement(tag), globalEventCoordinator);
    node.setChildren(children);
    Object.entries(props).forEach(([key, val]) => {
        node.setProperty(key, val);
        if ((0, atom_1.isAtom)(val)) {
            const ref = (0, atom_1.runEffect)(() => node.setProperty(key, val.get()));
            node.registerOnMountHook(() => ref.activate());
            node.registerOnUnmountHook(() => ref.deactivate());
        }
        else {
            node.setProperty(key, val);
        }
    });
    return node;
};
exports.createElement = createElement;
const createTextNode = (text) => {
    const node = new node_1.WNode(document.createTextNode(""));
    if ((0, atom_1.isAtom)(text)) {
        const ref = (0, atom_1.runEffect)(() => node.setProperty("textContent", text.get()));
        node.registerOnMountHook(ref.activate.bind(ref));
        node.registerOnUnmountHook(ref.deactivate.bind(ref));
    }
    else {
        node.setProperty("textContent", text);
    }
    return node;
};
exports.createTextNode = createTextNode;
const createFragment = (children) => {
    return new node_1.WNode(document.createDocumentFragment()).setChildren(children);
};
exports.createFragment = createFragment;
