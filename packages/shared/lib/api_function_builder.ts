
type F<Args extends unknown[], ReturnType> = (...args: [...Args]) => ReturnType;

/**
 * A generic higher order function
 */
export type FunctionDecorator<Args extends unknown[], ReturnType> = (fn: F<Args, ReturnType>) => F<Args, ReturnType>;

/**
 * A utility class that provides runtime decoration to exported functions, implemented as a singleton.
 */
export class DecoratableApiFunctionBuilder {
  private decoratorRegistry: Map<Function, FunctionDecorator<any[], any>[]> =
    new Map();
  private baseFuncRegistry: Map<Function, Function> = new Map();

  /**
   * A higher order method that provides runtime decoration support to the injected function
   *
   * @param baseFunc The function wrapped by the return function
   * @returns A wrapper function around the injected function, which may be further decorated at runtime.
   */
  public build<Args extends unknown[], ReturnType>(baseFunc: F<Args, ReturnType>): F<Args, ReturnType> {
    const externalFunc: F<Args, ReturnType> = ((...args) => {
      return this.composeFunction(externalFunc)(...args);
    }) as F<Args, ReturnType>;

    this.decoratorRegistry.set(externalFunc, []);
    this.baseFuncRegistry.set(externalFunc, baseFunc);

    return externalFunc;
  }

  /**
   * Registers runtime decorators for methods constructed by the build method
   *
   * @param apiFn The method _returned_ by the build method (not the injected function!)
   * @param decorator The higher order function to wrap the apiFn
   */
  public registerDecorator<Args extends unknown[], ReturnType>(
    apiFn: F<Args, ReturnType>,
    decorator: FunctionDecorator<Args, ReturnType>
  ): void {
    if (!this.decoratorRegistry.has(apiFn)) {
      // TODO(ericr): more specific error type
      throw new Error("decorating the provided function is not supported");
    }

    this.decoratorRegistry.get(apiFn)!.push(decorator);
  }

  /**
   * Unregisters any runtime decorators injected via the registerDecorator method
   *
   * @param apiFn The method _returned_ by the build method (not the injected function!)
   * @param decorator The higher order decorator that is to be removed
   */
  public deregisterDecorator<Args extends unknown[], ReturnType>(
    apiFn: F<Args, ReturnType>,
    decorator: FunctionDecorator<Args, ReturnType>
  ): void {
    this.decoratorRegistry.set(
      apiFn,
      (this.decoratorRegistry.get(apiFn) ?? []).filter(
        (dec) => dec !== decorator
      )
    );
  }

  /**
   * Takes the external function and applies all registered decorators in FIFO order of registration, returning
   * the decorated function. This is done lazily at runtime to enable runtime decoration.
   *
   * @param externalFunc The method _returned_ by the build method
   * @returns The composed function, being the registered base function with all of the currently registered decorators
   *          applied.
   */
  private composeFunction<Args extends unknown[], ReturnType>(
    externalFunc: (...args: [...Args]) => ReturnType): (...args: [...Args]) => ReturnType {

    if (!this.baseFuncRegistry.has(externalFunc)) {
      // TODO(ericr): more specific message and type
      throw new Error("unable to compose unknown function");
    }

    const baseFunc = this.baseFuncRegistry.get(externalFunc) as F<Args, ReturnType>;
    const decorations: FunctionDecorator<Args, ReturnType>[] = this.decoratorRegistry.get(
      externalFunc
    ) as FunctionDecorator<Args, ReturnType>[];

    return decorations.reduceRight(
      (composedFunc: F<Args, ReturnType>, decorator: FunctionDecorator<Args, ReturnType>) => decorator(composedFunc),
      baseFunc,
    );
  }
}
