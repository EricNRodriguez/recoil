import { WElement, WNode } from "../../../dom";
import { ComponentContext, IComponentContext } from "./component_context";
import { ScopedInjectionRegistry } from "./inject";
import { Consumer, Function } from "../../../util";

/**
 * A plain old javascript function that consumes a IComponentContext and returns a wNode (or subclass of it)
 */
export type StatefulDomBuilder<T extends WNode<Node>> = (
  ctx: ComponentContext,
  ...args: any[]
) => T;

/**
 * A plain old javascript function that returns a wNode (or a subclass of it)
 */
export type DomBuilder<T extends WNode<Node>> = (...args: any[]) => T;

let globalInjectionScope: ScopedInjectionRegistry =
  new ScopedInjectionRegistry();

const executeWithContext = <T>(fn: Function<ComponentContext, T>): T => {
  const prevInjScope = globalInjectionScope;

  const ch = ScopedInjectionRegistry.fork(globalInjectionScope);
  ch.enterScope();

  globalInjectionScope = ch;
  try {
    return fn(
      new ComponentContext(
        ch,
      )
    );
  } finally {
    ch.exitScope();
    globalInjectionScope = prevInjScope;
  }
};


export const createComponent = <T extends WNode<Node>>(
  buildDomTree: StatefulDomBuilder<T>
): DomBuilder<T> => {
  return (...args: any[]): T => {
    return executeWithContext<T>((ctx: ComponentContext): T => {
      const node: T = buildDomTree(ctx, ...args);
      ctx.applyDeferredFunctions(node);
      return node;
    });
  };
};

/**
 * Wraps a lazy builder inside a closure such that the current injection scope state is captured and restored
 * on each invocation. I.e. the returned DomBuilder forms a cosure over the injection scope.
 *
 * This is intended to be abstracted away inside control components that manage the rebuilding of components. The end user
 * shouldn't need to know how the injection api works, just that it does what is intuitive.
 *
 * @param builder The builder function to close over the current injection scope
 */
export const lazy = <T extends WNode<Node>>(builder: DomBuilder<T>): DomBuilder<T> => {
    const capturedInjectionScope: ScopedInjectionRegistry = ScopedInjectionRegistry.fork(globalInjectionScope);
    return (...args: any[]): T => {
        const currentInjectionScope: ScopedInjectionRegistry = globalInjectionScope;
        capturedInjectionScope.enterScope();
        try {
            return builder(...args);
        } finally {
          capturedInjectionScope.exitScope();
          globalInjectionScope = currentInjectionScope;
        }
    };
}
