"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supply = void 0;
const element_1 = require("../element");
const atom_1 = require("atom");
const supply = (props) => {
    const node = (0, element_1.frag)();
    const ref = (0, atom_1.runEffect)(() => {
        node.setChildren([props.get()]);
    });
    node.registerOnMountHook(() => ref.activate());
    node.registerOnUnmountHook(() => ref.deactivate());
    return node;
};
exports.supply = supply;
