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

const globalInjectionScope: ScopedInjectionRegistry =
  new ScopedInjectionRegistry();

const executeWithContext = <T>(fn: Function<ComponentContext, T>): T => {
  try {
    globalInjectionScope.enterScope();
    return fn(new ComponentContext(globalInjectionScope));
  } finally {
    globalInjectionScope.exitScope();
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
