import { HtmlVNode } from "../vdom/virtual_node";
import {
  registerDecorator,
  deregisterDecorator,
  SideEffectRef,
  RunEffectSignature,
  runEffect,
  Atom,
  CreateStateSignature,
  createState,
  LeafAtom,
  DeriveStateSignature,
  DerivedAtom,
  derivedState,
  fetchState,
  FetchStateSignature,
} from "../../../atom";
import { Producer, Runnable } from "../../../util";
import { FunctionDecorator } from "../../../atom/src/api";

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
  const effects: SideEffectRef[] = [];
  const atoms: Atom<any>[] = [];

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
      effects.push(effect);
      return effect;
    };
  };

  /**
   * A runtime decorator around the createState method (provided by the atom package) that collects them for future use.
   *
   * @param createState The current createState method (may or may not be already decorated)
   * @returns A decoration of the provided createState method
   */
  const collectCreatedLeafAtomsDecorator = <T>(
    createState: CreateStateSignature<T>
  ): CreateStateSignature<T> => {
    return (value: T): LeafAtom<T> => {
      const atom = createState(value);
      atoms.push(atom);
      return atom;
    };
  };

  /**
   * A runtime decorator around the deriveState method (provided by the atom package) that collects them for future use.
   *
   * @param deriveState The current deriveState method (may or may not be already decorated)
   * @returns A decoration of the provided deriveState method
   */
  const collectCreatedDerivedAtomsDecorator = <T>(
    deriveState: DeriveStateSignature<T>
  ): DeriveStateSignature<T> => {
    return (derivation: Producer<T>): DerivedAtom<T> => {
      const atom = deriveState(derivation);
      atoms.push(atom);
      return atom;
    };
  };

  /**
   * A runtime decorator around the fetchState method (provided by the atom package) that collects them for future use.
   *
   * @param fetchState The current fetchState method (may or may not be already decorated)
   * @returns A decoration of the provided fetchState method
   */
  const collectCreatedFetchedAtomsDecorator = <T>(
    fetchState: FetchStateSignature<T>
  ): FetchStateSignature<T> => {
    return (fetch: Producer<Promise<T>>): Atom<T | undefined> => {
      const atom = fetchState(fetch);
      atoms.push(atom);
      return atom;
    };
  };

  return (...args: any[]): T => {
    try {
      registerDecorator(runEffect, collectCreatedEffects);
      registerDecorator(createState, collectCreatedLeafAtomsDecorator<any>);
      registerDecorator(derivedState, collectCreatedDerivedAtomsDecorator<any>);
      registerDecorator(fetchState, collectCreatedFetchedAtomsDecorator<any>);

      const componentRoot: T = fn(...args);

      effects.forEach((ref) => {
        componentRoot.registerOnMountHook(ref.activate.bind(ref));
        componentRoot.registerOnUnmountHook(ref.deactivate.bind(ref));
      });

      (componentRoot as any).$$$recoilComponentScopedAtoms = atoms;

      return componentRoot;
    } finally {
      deregisterDecorator(runEffect, collectCreatedEffects);
      deregisterDecorator(createState, collectCreatedLeafAtomsDecorator<any>);
      deregisterDecorator(
        derivedState,
        collectCreatedDerivedAtomsDecorator<any>
      );
      deregisterDecorator(fetchState, collectCreatedFetchedAtomsDecorator<any>);
    }
  };
};
