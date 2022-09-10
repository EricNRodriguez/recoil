"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.coupledCounter = void 0;
var dom_component_1 = require("recoil/packages/dom-component");
var atom_1 = require("recoil/packages/atom");
var dom_dsl_1 = require("recoil/packages/dom-dsl");
var log_component_1 = require("./log_component");
var Logger = /** @class */ (function () {
    function Logger() {
        this.logs = [];
    }
    Logger.prototype.logMessage = function (msg) {
        this.logs = __spreadArray(__spreadArray([], this.logs, true), [
            msg,
        ], false);
    };
    Logger.prototype.getLogs = function () {
        return this.logs;
    };
    __decorate([
        (0, atom_1.state)()
    ], Logger.prototype, "logs");
    return Logger;
}());
exports.coupledCounter = (0, dom_component_1.createComponent)(function () {
    var logger = new Logger();
    var a = (0, atom_1.createState)(0);
    var b = (0, atom_1.createState)(0);
    var c = (0, atom_1.createState)(0);
    var state = (0, atom_1.createState)(true);
    var incAButton = (0, dom_dsl_1.button)({
        content: "a++",
        onClick: function () { return a.set(a.get() + 1); }
    });
    var incBButton = (0, dom_dsl_1.button)({
        content: "b++",
        onClick: function () { return b.set(b.get() + 1); }
    });
    var incCButton = (0, dom_dsl_1.button)({
        content: "c++",
        onClick: function () { return c.set(c.get() + 1); }
    });
    var flipStateButton = (0, dom_dsl_1.button)({
        content: "flip state",
        onClick: function () { return state.set(!state.get()); }
    });
    return (0, dom_dsl_1.div)(incAButton, incBButton, incCButton, flipStateButton, (0, dom_dsl_1.br)(), (0, dom_dsl_1.ifElse)(state, dComponent(logger, a, b), eComponent(logger, a, b, c)), (0, dom_dsl_1.hr)(), (0, log_component_1.log)(function () { return logger.getLogs(); }));
});
var dComponent = (0, dom_component_1.createComponent)(function (logger, a, b) {
    (0, dom_component_1.runMountedEffect)(function () {
        a.get();
        b.get();
        (0, atom_1.runUntracked)(function () {
            logger.logMessage("dComponent was updated");
        });
    });
    (0, dom_component_1.onMount)(function () { return (0, atom_1.runUntracked)(function () { return logger.logMessage("dComponent mounted"); }); });
    (0, dom_component_1.onUnmount)(function () { return (0, atom_1.runUntracked)(function () { return logger.logMessage("dComponent unmounted"); }); });
    var elem = (0, dom_dsl_1.div)((0, dom_dsl_1.div)("d content"), (0, dom_dsl_1.div)((0, dom_dsl_1.t)(function () { return (a.get() + b.get()).toString(); })));
    return elem;
});
var eComponent = (0, dom_component_1.createComponent)(function (logger, a, b, c) {
    (0, dom_component_1.runMountedEffect)(function () {
        a.get();
        b.get();
        c.get();
        logger.logMessage("eComponent was updated");
    });
    (0, dom_component_1.onMount)(function () { return (0, atom_1.runUntracked)(function () { return logger.logMessage("eComponent mounted"); }); });
    (0, dom_component_1.onUnmount)(function () { return (0, atom_1.runUntracked)(function () { return logger.logMessage("eComponent unmounted"); }); });
    (0, dom_component_1.onInitialMount)(function () { return (0, atom_1.runUntracked)(function () { return logger.logMessage("eComponent initial mount called"); }); });
    var elem = (0, dom_dsl_1.div)((0, dom_dsl_1.div)("e content"), (0, dom_dsl_1.div)((0, dom_dsl_1.t)(function () { return (a.get() + b.get() + c.get()).toString(); })));
    return elem;
});
