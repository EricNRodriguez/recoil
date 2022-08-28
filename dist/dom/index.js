"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextNode = exports.createFragment = exports.createElement = exports.WElement = exports.isWNode = exports.WNode = void 0;
var node_1 = require("./src/node");
Object.defineProperty(exports, "WNode", { enumerable: true, get: function () { return node_1.WNode; } });
Object.defineProperty(exports, "isWNode", { enumerable: true, get: function () { return node_1.isWNode; } });
var element_1 = require("./src/element");
Object.defineProperty(exports, "WElement", { enumerable: true, get: function () { return element_1.WElement; } });
var factory_1 = require("./src/factory");
Object.defineProperty(exports, "createElement", { enumerable: true, get: function () { return factory_1.createElement; } });
Object.defineProperty(exports, "createFragment", { enumerable: true, get: function () { return factory_1.createFragment; } });
Object.defineProperty(exports, "createTextNode", { enumerable: true, get: function () { return factory_1.createTextNode; } });
//# sourceMappingURL=index.js.map