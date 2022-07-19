import { HtmlVNode } from "../vdom/virtual_node";
import { SideEffectRef, runEffect } from "../../../atom";
import { Runnable } from "../../../util";
import {ComponentScope} from "./component_scope";

/**
 * A convenience method for creating and mounting an effect in a single function call
 *
 * @param sideEffect The side effect to be created and mounted
 */
export const runMountedEffect = (sideEffect: Runnable): void => {
  ComponentScope.getInstance().collectEffect(runEffect(sideEffect));
};

/**
 * Mounts the provided ref to the component currently under construction. This will bind the lifecycle
 * of the effect to the component, such that when the component is mounted in the DOM, the effect will
 * be active, and when it is unmounted, the effect will be inactive.
 *
 * @param ref The references of the side effect to be mounted
 */
export const mountEffect = (ref: SideEffectRef): void => {
  if (!ComponentScope.getInstance().isInScope()) {
    // TODO(ericr): more specific error message
    throw new Error("unable to mount effect outside of createComponent scope");
  }
  ComponentScope.getInstance().collectEffect(ref);
};

/**
 * A plain old javascript function that returns a HtmlVNode (or subclass of it)
 */
export type DomBuilder<T extends HtmlVNode> = (...args: any[]) => T;

/**
 * A higher order function that creates components. A component is any stateful Dom builder, i.e. any function
 * that constructs a DOM tree that contains ANY stateful logic.
 *
 * This function provides some 'magic' that automatically binds the lifecycle of any side effects created within
 * the injected builder to the lifecycle of the constructed Dom node. I.e. when it is mounted, they are activated,
 * when it is unmounted, they are deactivated. This is critical for performance, as it ensures that the only eager
 * updates being made to the DOM are visible by the user. A result of this is that side effects are automatically
 * kept alive for the lifetime of the DOM tree, which means the references returned by the runEffect factory method
 * can be safely ignored.
 *
 * @param fn The HtmlVNode builder to be wrapped.
 * @returns The wrapped function
 */
export const createComponent = <T extends HtmlVNode>(
  fn: DomBuilder<T>
): DomBuilder<T> => {
  return (...args: any[]): T => {
    try {
      ComponentScope.getInstance().enterScope();

      const componentRoot: T = fn(...args);

      ComponentScope.getInstance()
        .getEffects()
        .forEach((ref) => {
          componentRoot.registerOnMountHook(ref.activate.bind(ref));
          componentRoot.registerOnUnmountHook(ref.deactivate.bind(ref));
        });

      return componentRoot;
    } finally {
      ComponentScope.getInstance().exitScope();
    }
  };
};
