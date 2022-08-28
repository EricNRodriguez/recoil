"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapInVNode = exports.unwrapVNode = exports.isWNode = exports.WNode = exports.BaseWNode = void 0;
const utils_1 = require("utils");
const reconcile_1 = require("./reconcile");
class BaseWNode {
    constructor(node) {
        this.parent = null;
        this.children = [];
        this.onMountHooks = new Set();
        this.onUnmountHooks = new Set();
        this.currentlyMounted = false;
        this.node = node;
        this.isDocumentFragment = this.node instanceof DocumentFragment;
    }
    isFragment() {
        return this.isDocumentFragment;
    }
    setProperty(prop, value) {
        this.unwrap()[prop] = value;
        return this;
    }
    getUnpackedChildren() {
        const unpackedNodes = [];
        for (let wNode of this.getChildren()) {
            if (wNode.isFragment()) {
                for (let child of wNode.getUnpackedChildren()) {
                    unpackedNodes.push(child);
                }
            }
            else {
                unpackedNodes.push(wNode.unwrap());
            }
        }
        return unpackedNodes;
    }
    getChildren() {
        return this.children;
    }
    rebindChildren() {
        this.setChildren(this.children);
    }
    setChildren(children) {
        const newChildren = children
            .map(exports.wrapInVNode)
            .filter(utils_1.notNullOrUndefined);
        const newChildrenSet = new Set(newChildren);
        // unmount any current children that are not in the newChildren list
        if (this.isMounted()) {
            this.children
                .filter((cc) => !newChildrenSet.has(cc))
                .forEach((cc) => {
                cc.unmount();
                cc.setParent(null);
            });
        }
        this.children.length = 0;
        this.children.push(...newChildren);
        // sync mount status of new children to this dom node
        newChildren.forEach((nc) => {
            nc.setParent(this);
            this.syncMountStatusOfChild(nc);
        });
        if (this.isFragment()) {
            this.getParent()?.rebindChildren();
            return this;
        }
        (0, reconcile_1.reconcileNodeArrays)({
            parent: this.unwrap(),
            currentNodes: Array.from(this.unwrap().childNodes),
            newNodes: this.getUnpackedChildren(),
        });
        return this;
    }
    syncMountStatusOfChild(child) {
        child.setParent(this);
        if (this.isMounted() !== child.isMounted()) {
            this.isMounted() ? child.mount() : child.unmount();
        }
    }
    isMounted() {
        return this.currentlyMounted;
    }
    setParent(parent) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }
    mount() {
        this.currentlyMounted = true;
        this.children.forEach((child) => {
            child.mount();
        });
        this.runMountHooks();
        return this;
    }
    unmount() {
        this.currentlyMounted = false;
        this.children.forEach((child) => {
            child.unmount();
        });
        this.runUnmountHooks();
        return this;
    }
    runUnmountHooks() {
        this.onUnmountHooks.forEach((hook) => hook());
    }
    runMountHooks() {
        this.onMountHooks.forEach((hook) => hook());
    }
    registerOnMountHook(hook) {
        this.onMountHooks.add(hook);
        return this;
    }
    registerOnUnmountHook(hook) {
        this.onUnmountHooks.add(hook);
        return this;
    }
    unwrap() {
        return this.node;
    }
}
exports.BaseWNode = BaseWNode;
class WNode extends BaseWNode {
    constructor(node) {
        super(node);
    }
}
exports.WNode = WNode;
const isWNode = (content) => {
    return content instanceof Object && "unwrap" in content;
};
exports.isWNode = isWNode;
const unwrapVNode = (content) => {
    if (content === null || content === undefined) {
        return content;
    }
    if ((0, exports.isWNode)(content)) {
        return content.unwrap();
    }
    return content;
};
exports.unwrapVNode = unwrapVNode;
const wrapInVNode = (node) => {
    if ((0, utils_1.nullOrUndefined)(node)) {
        return node;
    }
    if ((0, exports.isWNode)(node)) {
        return node;
    }
    else {
        return new WNode(node);
    }
};
exports.wrapInVNode = wrapInVNode;
