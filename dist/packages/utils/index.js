"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WDerivationCache = exports.firstNonEqualIndex = exports.wrapStaticContentInProvider = exports.clamp = exports.removeNullAndUndefinedItems = exports.nullOrUndefined = exports.notNullOrUndefined = void 0;
var type_check_1 = require("./src/type_check");
Object.defineProperty(exports, "notNullOrUndefined", { enumerable: true, get: function () { return type_check_1.notNullOrUndefined; } });
Object.defineProperty(exports, "nullOrUndefined", { enumerable: true, get: function () { return type_check_1.nullOrUndefined; } });
Object.defineProperty(exports, "removeNullAndUndefinedItems", { enumerable: true, get: function () { return type_check_1.removeNullAndUndefinedItems; } });
var math_1 = require("./src/math");
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return math_1.clamp; } });
var util_1 = require("./src/util");
Object.defineProperty(exports, "wrapStaticContentInProvider", { enumerable: true, get: function () { return util_1.wrapStaticContentInProvider; } });
var list_1 = require("./src/list");
Object.defineProperty(exports, "firstNonEqualIndex", { enumerable: true, get: function () { return list_1.firstNonEqualIndex; } });
var weak_cache_1 = require("./src/weak_cache");
Object.defineProperty(exports, "WDerivationCache", { enumerable: true, get: function () { return weak_cache_1.WDerivationCache; } });
