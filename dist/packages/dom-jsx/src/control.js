"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suspense = exports.Switch = exports.If = exports.For = exports.Supply = void 0;
const utils_1 = require("../../utils");
const dom_dsl_1 = require("../../dom-dsl");
const atom_1 = require("../../atom");
const dom_dsl_2 = require("../../dom-dsl");
const dom_1 = require("../../dom");
const Supply = (props) => {
    const node = (0, dom_dsl_2.frag)();
    const ref = (0, atom_1.runEffect)(() => {
        node.setChildren([props.getChild()]);
    });
    node.registerOnMountHook(() => ref.activate());
    node.registerOnUnmountHook(() => ref.deactivate());
    return node;
};
exports.Supply = Supply;
const For = (props) => {
    return (0, dom_dsl_1.forEach)(props);
};
exports.For = For;
const If = (props) => {
    return (0, dom_dsl_1.ifElse)({
        condition: props.condition,
        ifTrue: props.true,
        ifFalse: props.false,
    });
};
exports.If = If;
const Switch = (props) => {
    const caseMatchMap = new Map(props.cases);
    return (0, dom_dsl_1.match)({
        state: props.value,
        render: (value) => {
            const result = caseMatchMap.get(value) ?? props.default ?? (() => (0, dom_1.createFragment)([]));
            return result();
        },
    });
};
exports.Switch = Switch;
const Suspense = (props, ...children) => {
    const anchor = (0, dom_dsl_2.frag)();
    if ((0, utils_1.notNullOrUndefined)(props.default)) {
        anchor.setChildren([props.default]);
    }
    Promise.all(children).then((syncChildren) => {
        anchor.setChildren(syncChildren);
    });
    return anchor;
};
exports.Suspense = Suspense;
