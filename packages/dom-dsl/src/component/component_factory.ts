import { WElement, WNode } from "../../../dom";
import { ComponentContext } from "./component_context";
import {ScopedInjectionSymbolTable} from "./inject";

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

const globalInjectionScope: ScopedInjectionSymbolTable = new ScopedInjectionSymbolTable();

export const createComponent = <T extends WNode<Node>>(
  buildDomTree: StatefulDomBuilder<T>
): DomBuilder<T> => {
  return (...args: any[]): T => {
    try {
      globalInjectionScope.enterScope();
      const ctx: ComponentContext = new ComponentContext(globalInjectionScope);
      const node: T = buildDomTree(ctx, ...args);
      ctx.applyDeferredFunctions(node);
      return node;
    } finally {
      globalInjectionScope.exitScope();
    }
  };
};
