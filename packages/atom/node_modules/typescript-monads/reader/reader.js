var Reader = /** @class */ (function () {
    function Reader(fn) {
        this.fn = fn;
    }
    Reader.prototype.of = function (fn) {
        return new Reader(fn);
    };
    Reader.prototype.flatMap = function (fn) {
        var _this = this;
        return new Reader(function (c) { return fn(_this.run(c)).run(c); });
    };
    Reader.prototype.map = function (fn) {
        var _this = this;
        return new Reader(function (c) { return fn(_this.run(c)); });
    };
    Reader.prototype.run = function (config) {
        return this.fn(config);
    };
    return Reader;
}());
export { Reader };
//# sourceMappingURL=reader.js.map