var StatePair = /** @class */ (function () {
    function StatePair(state, value) {
        this.state = state;
        this.value = value;
    }
    return StatePair;
}());
export { StatePair };
var State = /** @class */ (function () {
    function State(fn) {
        this.fn = fn;
    }
    State.prototype.of = function (fn) {
        return new State(fn);
    };
    State.prototype.map = function (fn) {
        var _this = this;
        return new State(function (c) { return fn(_this.run(c)); });
    };
    State.prototype.flatMap = function (fn) {
        var _this = this;
        return new State(function (c) {
            var pair = fn(_this.run(c)).run(c);
            return [pair.state, pair.value];
        });
    };
    State.prototype.run = function (config) {
        var tupple = this.fn(config);
        return new StatePair(tupple[0], tupple[1]);
    };
    return State;
}());
export { State };
//# sourceMappingURL=state.js.map