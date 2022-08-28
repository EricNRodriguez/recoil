import { Supplier } from "./function.interface";
export declare const wrapStaticContentInProvider: <T>(content: T | Supplier<T>) => Supplier<T>;
