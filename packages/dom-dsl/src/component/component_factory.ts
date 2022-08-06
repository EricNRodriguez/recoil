import { WElement, WNode } from "../../../dom";
import { ComponentContext } from "./component_context";

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

export const createComponent = <T extends WNode<Node>>(
  buildDomTree: StatefulDomBuilder<T>
): DomBuilder<T> => {
  return (...args: any[]): T => {
    const ctx: ComponentContext = new ComponentContext();
    const node: T = buildDomTree(ctx, ...args);
    ctx.applyDeferredFunctions(node);
    return node;
  };
};
