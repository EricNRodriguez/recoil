import { Runnable } from "../../util";
import { runEffect, ISideEffectRef } from "../../atom";
import { ComponentFactory } from "./component_factory";
import { VNode } from "../../vdom";

export const onMount = (effect: Runnable): void => {
  ComponentFactory.getInstance().registerNextComponentConsumer(
    (node: VNode): void => {
      node.registerOnMountHook(effect);
    }
  );
};

export const onUnmount = (effect: Runnable): void => {
  ComponentFactory.getInstance().registerNextComponentConsumer(
    (node: VNode): void => {
      node.registerOnUnmountHook(effect);
    }
  );
};

export const onInitialMount = (effect: Runnable): void => {
  let called: boolean = false;
  onMount((): void => {
    if (called) {
      return;
    }

    called = true;
    effect();
  });
};

/**
 * A convenience method for creating and mounting an effect in a single function call
 *
 * @param sideEffect The side effect to be created and mounted
 */
export const runMountedEffect = (sideEffect: Runnable): void => {
  const ref = runEffect(sideEffect);
  ref.deactivate();
  mountEffect(ref);
};

/**
 * Mounts the provided ref to the component currently under construction. This will bind the lifecycle
 * of the effect to the component, such that when the component is mounted in the DOM, the effect will
 * be active, and when it is unmounted, the effect will be inactive.
 *
 * @param ref The references of the side effect to be mounted
 */
export const mountEffect = (ref: ISideEffectRef): void => {
  onMount(() => ref.activate());
  onUnmount(() => ref.deactivate());
};
