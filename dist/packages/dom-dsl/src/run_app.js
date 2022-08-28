"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runApp = void 0;
const dom_1 = require("../../dom");
const runApp = (anchor, app) => {
    anchor.$$$recoilVElementWrapper = (0, dom_1.createElement)(anchor, {}, [
        app,
    ]).mount();
};
exports.runApp = runApp;
