"use strict";
exports.__esModule = true;
var dom_dsl_1 = require("recoil/packages/dom-dsl");
var counter_component_1 = require("./counter_component");
(0, dom_dsl_1.runApp)(document.body, (0, counter_component_1.coupledCounter)());
