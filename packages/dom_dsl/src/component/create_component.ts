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

export type ComponentBuilder<T extends HtmlVNode> = (...args: any[]) => T;

export const createComponent = <T extends HtmlVNode>(
  fn: ComponentBuilder<T>
): ComponentBuilder<T> => {
  const collector: EffectCollector = new EffectCollector();

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

      collector
        .getEffects()
        .forEach((ref) => componentRoot.registerSideEffect(ref));

      return componentRoot;
    } finally {
      deregisterDecorator(runEffect, collectCreatedEffects);
    }
  };
};
