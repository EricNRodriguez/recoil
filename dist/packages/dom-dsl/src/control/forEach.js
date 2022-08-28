"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEach = exports.getItem = exports.getKey = void 0;
const utils_1 = require("utils");
const dom_1 = require("dom");
const atom_1 = require("atom");
// utility lenses for unboxing index and item from an IndexedItem
const getKey = (item) => item[0];
exports.getKey = getKey;
const getItem = (item) => item[1];
exports.getItem = getItem;
const forEach = (props) => {
    let { items, render } = props;
    const anchor = (0, dom_1.createFragment)([]);
    let currentItemIndex = new Map();
    const ref = (0, atom_1.runEffect)(() => {
        const newItems = items();
        const newItemOrder = newItems.map(exports.getKey);
        const newItemNodesIndex = new Map(newItems.map((item) => [
            (0, exports.getKey)(item),
            currentItemIndex.get((0, exports.getKey)(item)) ?? render((0, exports.getItem)(item)),
        ]));
        const newChildren = newItemOrder
            .map((key) => newItemNodesIndex.get(key))
            .filter(utils_1.notNullOrUndefined);
        anchor.setChildren(newChildren);
        currentItemIndex = newItemNodesIndex;
    });
    anchor.registerOnMountHook(() => ref.activate());
    anchor.registerOnUnmountHook(() => ref.deactivate());
    return anchor;
};
exports.forEach = forEach;
