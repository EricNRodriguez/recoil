import {ComponentContext, IComponentContext} from "./component_context";
import {ScopedInjectionRegistry} from "./inject";
import {Function} from "../../../../util";
import {WNode} from "../../core/node";

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

/**
 * A plain old javascript function that accepts a props object and zero or more children, and returns a WNode<Node>
 */
export type Component<Props extends Object, Children extends unknown[], ReturnNode extends WNode<Node>> =
  (props: Props, ...children: [...Children]) => ReturnNode;

/**
 * Curries a component context into the provided component builder
 *
 * @param buildComponent A component builder
 */
export const createComponent = <Props extends Object, Children extends unknown[], ReturnNode extends WNode<Node>>(
  buildComponent: (ctx: IComponentContext, ...args: Parameters<Component<Props, Children, ReturnNode>>) => ReturnNode,
): Component<Props, Children, ReturnNode> => {
  return (...args: Parameters<Component<Props, Children, ReturnNode>>) => {
    return executeWithContext<ReturnNode>((ctx: ComponentContext): ReturnNode => {
      const node: ReturnNode = buildComponent(ctx, ...args);
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
 * @param component The component to close over the current context scope
 */
export const lazy = <Props extends Object, ReturnNode extends WNode<Node>, Children extends unknown[]>(
  component: Component<Props, Children, ReturnNode>,
): Component<Props, Children, ReturnNode> => {
  const capturedInjectionScope: ScopedInjectionRegistry = globalInjectionScope.fork();
  return (...args: Parameters<typeof component>): ReturnNode => {
    const currentInjectionScope: ScopedInjectionRegistry = globalInjectionScope;
    globalInjectionScope = capturedInjectionScope;
    try {
      return component(...args);
    } finally {
      globalInjectionScope = currentInjectionScope;
    }
  }
};