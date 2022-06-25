/**
 * @name Logger
 * @class Perform calculation while collecting logs
 */
var Logger = /** @class */ (function () {
    /**
     * @description Construct a Logger object.
     * @constructor
     * @param {TLogs[]} logs The collection of logs.
     * @param {TValue} value The value to wrap.
     */
    function Logger(logs, value) {
        this.logs = logs;
        this.value = value;
    }
    /**
     * @name Logger
     * @description Helper function to build a Logger object.
     * @static
     * @param {TLogs[]} story The collection of logs.
     * @param {TValue} value The value to wrap.
     * @returns {Logger<TLogs, TValue>} A Logger object containing the collection of logs and value.
     */
    Logger.logger = function (logs, value) {
        return new Logger(logs, value);
    };
    Logger.tell = function (s) {
        return new Logger([s], 0);
    };
    Logger.startWith = function (s, value) {
        return new Logger([s], value);
    };
    Logger.prototype.of = function (v) {
        return new Logger([], v);
    };
    Logger.prototype.flatMap = function (fn) {
        var result = fn(this.value);
        return new Logger(this.logs.concat(result.logs), result.value);
    };
    Logger.prototype.flatMapPair = function (fn) {
        var result = fn(this.value);
        return new Logger(this.logs.concat(result[0]), result[1]);
    };
    Logger.prototype.runUsing = function (fn) {
        return fn({ logs: this.logs, value: this.value });
    };
    return Logger;
}());
export { Logger };
//# sourceMappingURL=logger.js.map