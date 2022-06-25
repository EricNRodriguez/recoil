var Either = /** @class */ (function () {
    function Either(left, right) {
        this.left = left;
        this.right = right;
        if (this.neitherExist()) {
            throw new TypeError('Either requires a left or a right');
        }
        if (this.bothExist()) {
            throw new TypeError('Either cannot have both a left and a right');
        }
    }
    Either.exists = function (value) {
        return typeof value !== 'undefined' && value !== null;
    };
    Either.prototype.bothExist = function () {
        return this.isLeft() && this.isRight();
    };
    Either.prototype.neitherExist = function () {
        return !this.isLeft() && !this.isRight();
    };
    Either.prototype.isLeft = function () {
        return Either.exists(this.left);
    };
    Either.prototype.isRight = function () {
        return Either.exists(this.right);
    };
    Either.prototype.match = function (pattern) {
        return this.isRight()
            ? pattern.right(this.right)
            : pattern.left(this.left);
    };
    Either.prototype.tap = function (pattern) {
        this.isRight()
            ? typeof pattern.right === 'function' && pattern.right(this.right)
            : typeof pattern.left === 'function' && pattern.left(this.left);
    };
    Either.prototype.map = function (fn) {
        return this.isRight()
            ? new Either(undefined, fn(this.right))
            : new Either(this.left);
    };
    Either.prototype.flatMap = function (fn) {
        return this.isRight()
            ? fn(this.right)
            : new Either(this.left);
    };
    return Either;
}());
export { Either };
//# sourceMappingURL=either.js.map