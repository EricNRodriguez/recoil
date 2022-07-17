import { HtmlVNode } from "../vdom/virtual_node";
import {
  registerDecorator,
  deregisterDecorator,
  SideEffectRef,
  RunEffectSignature,
  runEffect,
} from "../../../atom";
import { Runnable } from "../../../util";
import { FunctionDecorator } from "../../../atom/src/api";

class EffectCollector {
  private effects: Set<SideEffectRef> = new Set();

  public collect(effect: SideEffectRef): void {
    this.effects.add(effect);
  }

  public getEffects(): SideEffectRef[] {
    return Array.from(this.effects);
  }
}

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
  const collector: EffectCollector = new EffectCollector();

  /**
   * A runtime decorator around the runEffect method (provided by the atom package) that collects them for future use.
   *
   * @param runEffect The current runEffect method (may or may not be already decorated)
   * @returns A decoration of the provided runEffect method
   */
  const collectCreatedEffects: FunctionDecorator<RunEffectSignature> = (
    runEffect: RunEffectSignature
  ): RunEffectSignature => {
    return (rawEffect: Runnable): SideEffectRef => {
      const effect: SideEffectRef = runEffect(rawEffect);

      collector.collect(effect);

      return effect;
    };
  };

  return (...args: any[]): T => {
    try {
      registerDecorator(runEffect, collectCreatedEffects);

      const componentRoot: T = fn(...args);

      collector.getEffects().forEach((ref) => {
        componentRoot.registerOnMountHook(ref.activate.bind(ref));
        componentRoot.registerOnUnmountHook(ref.deactivate.bind(ref));
      });
      return componentRoot;
    } finally {
      deregisterDecorator(runEffect, collectCreatedEffects);
    }
  };
};
