import { Maybe } from './maybe';
export function maybe(value) {
    return new Maybe(value);
}
export function none() {
    return Maybe.none();
}
export function some(value) {
    return maybe(value);
}
//# sourceMappingURL=maybe.factory.js.map