"use strict";
exports.__esModule = true;
exports.log = void 0;
var dom_component_1 = require("recoil/packages/dom-component");
var dom_dsl_1 = require("recoil/packages/dom-dsl");
exports.log = (0, dom_component_1.createComponent)(function (getLogs) {
    var style = {
        "height": "200px",
        "overflow-y": "auto"
    };
    var logContent = (0, dom_dsl_1.div)((0, dom_dsl_1.foreach)(function () { return getLogs().map(function (log, index) { return [index.toString(), [index, log]]; }); }, blockText)).setStyle(style);
    (0, dom_component_1.runMountedEffect)(function () {
        // track the logs
        // TODO(ericr): implement an 'beforeUpdate' and 'afterUpdate' hook
        getLogs();
        // run as a low priority job - i.e. after all the other updates...
        queueMicrotask(function () {
            var raw = logContent.getRaw();
            raw.scrollTop = raw.scrollHeight;
        });
    });
    return (0, dom_dsl_1.div)((0, dom_dsl_1.h3)("Logs:"), logContent);
});
var blockText = (0, dom_component_1.createComponent)(function (_a) {
    var index = _a[0], content = _a[1];
    var style = {
        "background-color": index % 2 === 0 ? "red" : "green",
        "margin-top": "0px",
        "margin-bottom": "0px"
    };
    return (0, dom_dsl_1.p)(content)
        .setStyle(style);
});
