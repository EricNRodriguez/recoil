import { F, FDecorator } from "./type";
export declare class DecoratableApiFunctionBuilder {
    private decoratorRegistry;
    private baseFuncRegistry;
    /**
     * A higher order method that provides runtime decoration support to the injected function
     *
     * @param baseFunc The function wrapped by the return function
     * @returns A wrapper function around the injected function, which may be further decorated at runtime.
     */
    build<Args extends unknown[], ReturnType>(baseFunc: F<Args, ReturnType>): F<Args, ReturnType>;
    /**
     * Registers runtime decorators for methods constructed by the build method
     *
     * @param apiFn The method _returned_ by the build method (not the injected function!)
     * @param decorator The higher order function to wrap the apiFn
     */
    registerDecorator<Args extends unknown[], ReturnType>(apiFn: F<Args, ReturnType>, decorator: FDecorator<Args, ReturnType>): void;
    /**
     * Unregisters any runtime decorators injected via the registerDecorator method
     *
     * @param apiFn The method _returned_ by the build method (not the injected function!)
     * @param decorator The higher order decorator that is to be removed
     */
    deregisterDecorator<Args extends unknown[], ReturnType>(apiFn: F<Args, ReturnType>, decorator: FDecorator<Args, ReturnType>): void;
    /**
     * Takes the external function and applies all registered decorators in FIFO order of registration, returning
     * the decorated function. This is done lazily at runtime to enable runtime decoration.
     *
     * @param externalFunc The method _returned_ by the build method
     * @returns The composed function, being the registered base function with all of the currently registered decorators
     *          applied.
     */
    private composeFunction;
}
//# sourceMappingURL=api_function_builder.d.ts.map