"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runApp = void 0;
__exportStar(require("packages/atom"), exports);
__exportStar(require("packages/dom"), exports);
__exportStar(require("packages/context"), exports);
__exportStar(require("packages/dom-dsl"), exports);
__exportStar(require("packages/dom-jsx"), exports);
var dom_dsl_1 = require("packages/dom-dsl");
Object.defineProperty(exports, "runApp", { enumerable: true, get: function () { return dom_dsl_1.runApp; } });
__exportStar(require("packages/lazy"), exports);
