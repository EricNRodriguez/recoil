import { Maybe, IMaybe } from "typescript-monads";
import {
  IAtom,
  ILeafAtom,
  ISideEffect,
  ISideEffectRef,
} from "./atom.interface";
import {AtomTrackingContext, ParentAtom} from "./context";
import { StatefulSideEffectError } from "./error";
import { WeakCollection } from "./weak_collection";
import {Producer, Runnable} from "../../util";

export const isAtom = (obj: any): boolean => {
  return (
    obj instanceof Object &&
    "get" in obj &&
    "getUntracked" in obj &&
    "invalidate" in obj &&
    "react" in obj
  );
};

class SideEffectRegistry<T> {
  private readonly activeEffects: Set<ISideEffect<T>> = new Set();
  private readonly inactiveEffects: Set<ISideEffect<T>> = new Set();

  public registerEffect(effect: ISideEffect<T>): void {
    if (this.activeEffects.has(effect) || this.inactiveEffects.has(effect)) {
      // TODO(ericr): use a more specific error
      throw new Error("duplicate registration of side effect");
    }

    this.activeEffects.add(effect);
  }

  public hasActiveEffects(): boolean {
    return this.activeEffects.size !== 0;
  }

  public getActiveEffects(): ISideEffect<T>[] {
    return Array.from(this.activeEffects);
  }

  public activateEffect(effect: ISideEffect<T>): void {
    this.inactiveEffects.delete(effect);
    this.activeEffects.add(effect);
  }

  public deactivateEffect(effect: ISideEffect<T>): void {
    this.activeEffects.delete(effect);
    this.inactiveEffects.add(effect);
  }
}



abstract class BaseAtom<T> implements IAtom<T> {
  private readonly context: AtomTrackingContext;
  private readonly effectScheduler: IEffectScheduler;
  private readonly parents: WeakCollection<ParentAtom> =
    new WeakCollection<DerivedAtom<Object>>();
  private readonly effects: SideEffectRegistry<T> = new SideEffectRegistry<T>();

  protected constructor(context: AtomTrackingContext, effectScheduler: IEffectScheduler) {
    this.context = context;
    this.effectScheduler = effectScheduler;
  }

  abstract get(): T;

  abstract getUntracked(): T;

  protected getParents(): ParentAtom[] {
    return this.parents.getItems();
  }

  protected forgetParents(): void {
    this.parents.reset();
  }

  public invalidate(): void {
    this.parents.forEach((parent: ParentAtom): void => {
      parent.childDirty();
      parent.childReady();
    });
  }

  protected getContext(): AtomTrackingContext {
    return this.context;
  }

  public latchToCurrentDerivation(): void {
    this.getContext()
      .getCurrentParent()
      .tapSome(this.parents.register.bind(this.parents));
  }

  protected scheduleEffects(): void {
    if (!this.effects.hasActiveEffects()) {
      return;
    }

    this.effectScheduler.schedule(this.scheduleEffectsCallback);
  }

  // intentionally an arrow function, since it allows us to pass
  // the function into the scheduler by reference, preventing duplicate 
  // updates within a single batch (the scheduler diffs by reference)
  private scheduleEffectsCallback = (): void => {
      // we want this to track, since the effects should be re-run whenever deps change
      // hence, we do a tracked get (instead of an untracked get) - this way if any deps read
      // within the get are dirtied then the effects will re-run eagerly.
      const value: T = this.get();
      this.effects
        .getActiveEffects()
        .forEach((effect: ISideEffect<T>) => effect(value));
  }

  public react(effect: ISideEffect<T>): ISideEffectRef {
    const cachedEffect: ISideEffect<T> = this.buildCachedEffect(effect);

    this.effects.registerEffect(cachedEffect);

    return {
      activate: () => {
        this.effects.activateEffect(cachedEffect);
        // TODO(ericr): this shouldnt always be run, but rather only when the version number of this
        // atom has increased since the last run. For now it is fine, since profiling hasnt revealed issues
        // + we get it for free due to the buildCachedEffect wrapper
        effect(this.get());
      },
      deactivate: () => {
        this.effects.deactivateEffect(cachedEffect);
      },
    };
  }

  private buildCachedEffect(effect: ISideEffect<T>): ISideEffect<T> {
    let prevValue: T | null = null;
    const cachedEffect: ISideEffect<T> = (newValue: T): void => {
      if (newValue !== prevValue) {
        prevValue = newValue;
        effect(newValue);
      }
    };

    cachedEffect(this.get());

    return cachedEffect;
  }
}

export interface IEffectScheduler {
  schedule(effect: Runnable): void;
}

export class LeafAtomImpl<T> extends BaseAtom<T> implements ILeafAtom<T> {
  private value: T;

  constructor(value: T, context: AtomTrackingContext, effectScheduler: IEffectScheduler) {
    super(context, effectScheduler);
    this.value = value;
  }

  public get(): T {
    this.latchToCurrentDerivation();
    return this.getUntracked();
  }

  public getUntracked(): T {
    return this.value;
  }

  public set(value: T): void {
    this.checkSetIsNotASideEffect();

    if (value === this.value) {
      return;
    }

    this.value = value;

    // intentionally kicking AFTER setting, since
    // we want our effects to run with the new values
    this.dirty();
  }

  public update(fn: (val: T) => T): void {
    this.set(fn(this.getUntracked()));
  }

  public dirty() {
    const prevParents: ParentAtom[] = this.getParents();
    this.forgetParents();

    this.scheduleEffects();

    prevParents.forEach((parent: ParentAtom): void => {
      parent.childDirty();
      parent.childReady();
    });
  }

  private checkSetIsNotASideEffect(): void {
    if (this.getContext().getCurrentParent().isSome()) {
      throw new StatefulSideEffectError(
        "stateful set called on leaf atom during derivation"
      );
    }
  }
}

export class DerivedAtom<T> extends BaseAtom<T> {
  private readonly deriveValue: Producer<T>;

  private value: IMaybe<T> = Maybe.none();
  private numChildrenNotReady: number = 0;

  constructor(deriveValue: Producer<T>, context: AtomTrackingContext, effectScheduler: IEffectScheduler) {
    super(context, effectScheduler);
    this.deriveValue = deriveValue;
  }

  public get(): T {
    this.latchToCurrentDerivation();
    return this.executeScopedDerivation();
  }

  private executeScopedDerivation(): T {
    try {
      this.getContext().pushParent(this);
      return this.getUntracked();
    } finally {
      this.getContext().popParent();
    }
  }

  public getUntracked(): T {
    this.value = this.value.match({
      none: (): IMaybe<T> => Maybe.some(this.deriveValue()),
      some: (some: NonNullable<T>): IMaybe<T> => Maybe.some(some),
    });

    return this.value.valueOrThrow("value should be some after derivation");
  }

  public childReady() {
    this.numChildrenNotReady--;

    if (this.numChildrenNotReady === 0) {
      const prevParents: ParentAtom[] = this.getParents();
      this.forgetParents();

      this.scheduleEffects();

      prevParents.forEach((parent: ParentAtom): void => {
        parent.childReady();
      });
    }
  }

  public childDirty() {
    this.discardCachedValue();

    if (this.numChildrenNotReady === 0) {
      this.getParents().forEach((parent: ParentAtom): void => {
        parent.childDirty();
      });
    }

    this.numChildrenNotReady++;
  }

  private discardCachedValue() {
    this.value = Maybe.none();
  }
}
