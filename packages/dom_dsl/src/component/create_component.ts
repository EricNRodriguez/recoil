import { HtmlVNode } from "../vdom/virtual_node";
import {
  registerDecorator,
  SideEffectRef,
  runEffect,
  Atom,
  createState,
  LeafAtom,
  DerivedAtom,
  fetchState,
  deriveState,
} from "../../../atom";

/**
 * A plain old javascript function that returns a HtmlVNode (or subclass of it)
 */
export type DomBuilder<T extends HtmlVNode> = (...args: any[]) => T;

/**
 * An ad-hoc scoped collector, analogous to a symbol table
 */
class ScopedAtomCollector {
  private readonly effects: Map<number, SideEffectRef[]> = new Map();
  private readonly leafAtoms: Map<number, LeafAtom<any>[]> = new Map();
  private readonly derivedAtoms: Map<number, DerivedAtom<any>[]> = new Map();
  private readonly fetchedAtoms: Map<number, Atom<any>[]> = new Map();

  private currentScope: number = -1;

  public enterScope(): void {
    this.currentScope++;
    this.effects.set(this.currentScope, []);
    this.leafAtoms.set(this.currentScope, []);
    this.derivedAtoms.set(this.currentScope, []);
    this.fetchedAtoms.set(this.currentScope, []);
  }

  public exitScope(): void {
    this.effects.delete(this.currentScope);
    this.leafAtoms.delete(this.currentScope);
    this.derivedAtoms.delete(this.currentScope);
    this.fetchedAtoms.delete(this.currentScope);

    this.currentScope--;
  }

  public collectEffect(effect: SideEffectRef): void {
    this.effects.get(this.currentScope)?.push(effect);
  }

  public getEffects(): SideEffectRef[] {
    return this.effects.get(this.currentScope) ?? [];
  }

  public collectLeafAtom(leaf: LeafAtom<any>): void {
    this.leafAtoms.get(this.currentScope)?.push(leaf);
  }

  public getLeafAtoms(): LeafAtom<any>[] {
    return this.leafAtoms.get(this.currentScope) ?? [];
  }

  public collectDerivedAtom(derivation: DerivedAtom<any>): void {
    this.derivedAtoms.get(this.currentScope)?.push(derivation);
  }

  public getDerivedAtoms(): DerivedAtom<any>[] {
    return this.derivedAtoms.get(this.currentScope) ?? [];
  }

  public collectFetchedAtom(fetchedAtom: Atom<any>): void {
    this.fetchedAtoms.get(this.currentScope)?.push(fetchedAtom);
  }

  public getFetchedAtoms(): Atom<any>[] {
    return this.fetchedAtoms.get(this.currentScope) ?? [];
  }
}

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
export const createComponent = (() => {
  const collector: ScopedAtomCollector = new ScopedAtomCollector();

  /**
   * A runtime decorator around the runEffect method (provided by the atom package) that collects them for future use.
   */
  registerDecorator(runEffect, (runEffectFn) => {
    return (rawEffect) => {
      const effect: SideEffectRef = runEffectFn(rawEffect);
      collector.collectEffect(effect);
      return effect;
    };
  });

  /**
   * A runtime decorator around the createState method (provided by the atom package) that collects them for future use.
   */
  registerDecorator(createState, (createStateFn) => {
    return (value) => {
      const atom = createStateFn(value);
      collector.collectLeafAtom(atom);
      return atom;
    };
  });

  /**
   * A runtime decorator around the deriveState method (provided by the atom package) that collects them for future use.
   */
  registerDecorator(deriveState, (deriveStateFn) => {
    return (derivation) => {
      const atom = deriveStateFn(derivation);
      collector.collectDerivedAtom(atom);
      return atom;
    };
  });

  /**
   * A runtime decorator around the fetchState method (provided by the atom package) that collects them for future use.
   */
  registerDecorator(fetchState, (fetchStateFn) => {
    return (fetch) => {
      const atom = fetchStateFn(fetch);
      collector.collectFetchedAtom(atom);
      return atom;
    };
  });

  return <T extends HtmlVNode>(fn: DomBuilder<T>): DomBuilder<T> => {
    return (...args: any[]): T => {
      try {
        collector.enterScope();

        const componentRoot: T = fn(...args);

        collector.getEffects().forEach((ref) => {
          componentRoot.registerOnMountHook(ref.activate.bind(ref));
          componentRoot.registerOnUnmountHook(ref.deactivate.bind(ref));
        });

        (componentRoot as any).$$$recoilComponentScopedAtoms = [
          ...collector.getLeafAtoms(),
          ...collector.getDerivedAtoms(),
          ...collector.getFetchedAtoms(),
        ];

        return componentRoot;
      } finally {
        collector.exitScope();
      }
    };
  };
})();
