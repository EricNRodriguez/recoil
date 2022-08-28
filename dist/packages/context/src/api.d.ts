import { SymbolKey } from "./inject";
import { Consumer, Runnable } from "utils";
import { WElement } from "dom";
export declare const defer: (deferredFunction: Consumer<WElement<HTMLElement>>) => void;
export declare const onInitialMount: (fn: Runnable) => void;
export declare const onMount: (fn: Runnable) => void;
export declare const onUnmount: (fn: Runnable) => void;
/**
 * Runs a side effect against the dom subtree enclosed by this context
 *
 * The effect will be automatically activated/deactivated with the mounting/unmounting
 * of the context, preventing unnecessary background updates to the dom.
 *
 * @param sideEffect The side effect that will be re-run every time its deps are dirtied.
 */
export declare const runMountedEffect: (sideEffect: Runnable) => void;
/**
 * A type safe DI provider analogous to that provided by the vue composition API.
 *
 * @param key The injection key.
 * @param value The raw value.
 */
export declare const provide: <T>(key: SymbolKey<T>, value: T) => void;
/**
 * Returns the value registered against the key, in the current components scope.
 *
 * This is a tracked operation.
 *
 * @param key The injection key.
 */
export declare const inject: <T>(key: SymbolKey<T>) => T | undefined;
/**
 * Decorates the provided component with a context, allowing the hooks provided by this api
 * to be used.
 *
 * @param component A context builder
 */
export declare const withContext: <Args extends unknown[], ReturnNode extends WElement<HTMLElement>>(component: (...args_0: Args) => ReturnNode) => (...args_0: Args) => ReturnNode;
/**
 * Wraps a callback inside a closure such that the current contexts scope state is captured and restored for each
 * sub-context run inside the callback.
 *
 * At this point in time, the only scoped state contained within the context API is that used by the dependency
 * injection code, however this wrapper fn is intended to be a catch-all single point for wiring in this sort of
 * behaviour for any future behaviour that requires similar hierarchical scope.
 *
 * @param fn The function to close over the current context scope
 */
export declare const captureContextState: <Args extends unknown[], ReturnType_1>(fn: (...args_0: Args) => ReturnType_1) => (...args_0: Args) => ReturnType_1;
