import {Runnable} from "../../../util";
import {ComponentScope} from "./component_scope";
import {runEffect, SideEffectRef} from "../../../atom";

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
