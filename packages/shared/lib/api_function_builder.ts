import {F, FDecorator} from "./type";

export class DecoratableApiFunctionBuilder {
  private decoratorRegistry: Map<Function, FDecorator<any, any>[]> =
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
    });

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
    decorator: FDecorator<Args, ReturnType>
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
    decorator: FDecorator<Args, ReturnType>
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
  private composeFunction<Args extends unknown[], ReturnType>(externalFunc: F<Args, ReturnType>): F<Args, ReturnType> {
    if (!this.baseFuncRegistry.has(externalFunc)) {
      // TODO(ericr): more specific message and type
      throw new Error("unable to compose unknown function");
    }

    const baseFunc: F<Args, ReturnType> = this.baseFuncRegistry.get(externalFunc) as F<Args, ReturnType>;
    const decorations: FDecorator<Args, ReturnType>[] = this.decoratorRegistry.get(externalFunc) as FDecorator<Args, ReturnType>[];

    return decorations.reduceRight(
      (composedFunc: F<Args, ReturnType>, decorator: FDecorator<Args, ReturnType>): F<Args, ReturnType> =>
        decorator(composedFunc),
      baseFunc
    );
  }
}
