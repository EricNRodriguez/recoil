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
exports.runApp = exports.suspense = exports.match = exports.ifElse = exports.forEach = void 0;
var forEach_1 = require("./src/control/forEach");
Object.defineProperty(exports, "forEach", { enumerable: true, get: function () { return forEach_1.forEach; } });
var if_1 = require("./src/control/if");
Object.defineProperty(exports, "ifElse", { enumerable: true, get: function () { return if_1.ifElse; } });
var match_1 = require("./src/control/match");
Object.defineProperty(exports, "match", { enumerable: true, get: function () { return match_1.match; } });
__exportStar(require("./src/element"), exports);
var suspense_1 = require("./src/control/suspense");
Object.defineProperty(exports, "suspense", { enumerable: true, get: function () { return suspense_1.suspense; } });
var run_app_1 = require("./src/run_app");
Object.defineProperty(exports, "runApp", { enumerable: true, get: function () { return run_app_1.runApp; } });
//# sourceMappingURL=index.js.map