import {VNode} from "../../vdom";
import {ComponentContext} from "./component_context";

/**
 * A plain old javascript function that consumes a IComponentContext and returns a VNode (or subclass of it)
 */
export type StatefulDomBuilder<T extends VNode<Node>> = (ctx: ComponentContext, ...args: any[]) => T;

/**
 * A plain old javascript function that returns a VNode (or a subclass of it)
 */
export type DomBuilder<T extends VNode<Node>> = (...args: any[]) => T;

export const createComponent = <T extends VNode<Node>>(buildDomTree: StatefulDomBuilder<T>): DomBuilder<T> => {
  const ctx: ComponentContext = new ComponentContext();

  return (...args: any[]): T => {
    const node: T = buildDomTree(ctx, ...args);

    ctx.applyDeferredFunctions(node);

    return node;
  }
}