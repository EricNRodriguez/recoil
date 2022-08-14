import { WElement, WNode } from "../../dom";
import { ComponentContext, IComponentContext } from "./component_context";
import { ScopedInjectionRegistry } from "./inject";
import { Consumer, Function } from "../../util";

/**
 * A plain old javascript function that consumes a IComponentContext and returns a wNode (or subclass of it)
 */
export type StatefulDomBuilder<P, T extends WNode<Node>> = (
  ctx: ComponentContext,
  props: P
) => T;

/**
 * A plain old javascript function that returns a wNode (or a subclass of it)
 */
export type DomBuilder<P, T extends WNode<Node>> = (props: P) => T;

let globalInjectionScope: ScopedInjectionRegistry =
  new ScopedInjectionRegistry();

const executeWithContext = <T>(fn: Function<ComponentContext, T>): T => {
  const parentScope = globalInjectionScope;

  // At first sight it might seem unintuitive / stupid that we are forking instead of pushing a new scope, however
  // in order to make provide calls made inside callbacks that execute after a builder has returned work as
  // you would expect, we need to fork and never pop. This allows for the same 'scoped' behaviour, but also
  // allows callbacks to work intuitively.
  globalInjectionScope = parentScope.fork();

  try {
    return fn(new ComponentContext(globalInjectionScope));
  } finally {
    globalInjectionScope = parentScope;
  }
};

// NOTE: ts has a disappointingly small degree of support for trafficking free params in a type safe way,
// which makes partial application completely unsafe type-wise, so I have opted for single arg components, in the
// form of 'props'. See: https://github.com/microsoft/TypeScript/issues/25256
export const createComponent = <P, T extends WNode<Node>>(
  buildDomTree: StatefulDomBuilder<P, T>
): DomBuilder<P, T> => {
  return (props: P): T => {
    return executeWithContext<T>((ctx: ComponentContext): T => {
      const node: T = buildDomTree(ctx, props);
      ctx.applyDeferredFunctions(node);
      return node;
    });
  };
};

/**
 * Wraps a lazy builder inside a closure such that the current contexts scope state is captured and restored
 * on each invocation. I.e. the returned DomBuilder forms a closure over the context scope.
 *
 * This is intended to be abstracted away inside control components that manage the rebuilding of components. The end user
 * shouldn't need to know how the component api works internally, just that it does what is intuitive.
 *
 * At this point in time, the only scoped state contained within the component API is that used by the dependency
 * injection code, however this wrapper fn is intended to be a catch-all single point for wiring in this sort of
 * behaviour for any future behaviour that requires similar hierarchical scope.
 *
 * @param builder The builder function to close over the current context scope
 */
export const lazy = <P, T extends WNode<Node>>(
  builder: DomBuilder<P, T>
): DomBuilder<P, T> => {
  const capturedInjectionScope: ScopedInjectionRegistry =
    globalInjectionScope.fork();
  return (props: P): T => {
    const currentInjectionScope: ScopedInjectionRegistry = globalInjectionScope;
    globalInjectionScope = capturedInjectionScope;
    try {
      return builder(props);
    } finally {
      globalInjectionScope = currentInjectionScope;
    }
  };
};
