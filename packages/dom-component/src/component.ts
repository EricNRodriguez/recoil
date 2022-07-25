import {VNode} from "../../vdom";
import {ComponentContext} from "./component_context";

/**
 * A plain old javascript function that returns a VNode (or subclass of it)
 */
export type ComponentBuilder<T extends VNode<Node>> = (ctx: ComponentContext, ...args: any[]) => T;


export type DomBuilder<T extends VNode<Node>> = (...args: any[]) => T;

export const createComponent = <T extends VNode<Node>>(buildDomTree: ComponentBuilder<T>): DomBuilder<T> => {
  const ctx: ComponentContext = new ComponentContext();

  return (...args: any[]): T => {
    const node: T = buildDomTree(ctx, ...args);

    ctx.applyDeferredFunctions(node);

    return node;
  }
}