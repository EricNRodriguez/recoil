"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonEmpty = exports.notNullOrUndefined = exports.nullOrUndefined = exports.removeNullAndUndefinedItems = void 0;
const removeNullAndUndefinedItems = (items) => {
    return items.filter((item) => item !== null && item !== undefined);
};
exports.removeNullAndUndefinedItems = removeNullAndUndefinedItems;
const nullOrUndefined = (item) => {
    return item === null || item === undefined;
};
exports.nullOrUndefined = nullOrUndefined;
const notNullOrUndefined = (item) => {
    return !(0, exports.nullOrUndefined)(item);
};
exports.notNullOrUndefined = notNullOrUndefined;
const nonEmpty = (col) => {
    return col.length !== 0;
};
exports.nonEmpty = nonEmpty;
