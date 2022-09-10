import { Maybe, IMaybe } from "typescript-monads";
import { IAtom, IMutableAtom } from "./atom.interface";
import { AtomTrackingContext, ParentAtom } from "./context";
import { StatefulSideEffectError } from "./error";
import { WeakCollection } from "./weak_collection";
import { Producer, Runnable, Function, Supplier } from "shared";

export const isAtom = (obj: any): boolean => {
  return (
    obj instanceof Object &&
    "get" in obj &&
    "getUntracked" in obj &&
    "invalidate" in obj &&
    "map" in obj
  );
};

abstract class BaseAtom<T> implements IAtom<T> {
  private readonly context: AtomTrackingContext;
  private readonly parents: WeakCollection<ParentAtom> = new WeakCollection<
    DerivedAtom<Object>
  >();

  protected constructor(context: AtomTrackingContext) {
    this.context = context;
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

  public map<R>(mutation: Function<T, R>): IAtom<R> {
    return new VirtualDerivedAtom(this.context, () => mutation(this.get()));
  }
}

export interface IEffectScheduler {
  schedule(effect: Runnable): void;
}

export class MutableAtom<T> extends BaseAtom<T> implements IMutableAtom<T> {
  private value: T;

  constructor(value: T, context: AtomTrackingContext) {
    super(context);
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

/**
 * A derivation that is logically a node in the DAG, but is actually just a virtual node - the runtime graph
 * has no knowledge of it.
 */
export class VirtualDerivedAtom<T> implements IAtom<T> {
  private readonly context: AtomTrackingContext;
  private readonly derivation: Supplier<T>;
  private readonly tracker: IMutableAtom<boolean>;

  constructor(context: AtomTrackingContext, derivation: Supplier<T>) {
    this.context = context;
    this.derivation = derivation;
    this.tracker = new MutableAtom(false, context);
  }

  public get(): T {
    this.tracker.get();
    return this.derivation();
  }

  public getUntracked(): T {
    this.context.enterNewTrackingContext();
    try {
      return this.get();
    } finally {
      this.context.exitCurrentTrackingContext();
    }
  }

  public invalidate(): void {
    this.tracker.invalidate();
  }

  public map<R>(transform: Function<T, R>): IAtom<R> {
    return new VirtualDerivedAtom(this.context, () => transform(this.get()));
  }
}

export class DerivedAtom<T> extends BaseAtom<T> {
  private readonly deriveValue: Producer<T>;

  private value: IMaybe<T> = Maybe.none();
  private numChildrenNotReady: number = 0;

  constructor(deriveValue: Producer<T>, context: AtomTrackingContext) {
    super(context);
    this.deriveValue = deriveValue;
  }

  public get(): T {
    this.latchToCurrentDerivation();
    return this.executeScopedDerivation();
  }

  private executeScopedDerivation(): T {
    try {
      this.getContext().pushParent(this);
      return this.getValue();
    } finally {
      this.getContext().popParent();
    }
  }

  public getUntracked(): T {
    this.getContext().enterNewTrackingContext();
    try {
      return this.executeScopedDerivation();
    } finally {
      this.getContext().exitCurrentTrackingContext();
    }
  }

  private getValue(): T {
    if (this.value.isNone()) {
      this.value = Maybe.some(this.deriveValue());
    }

    return this.value.valueOrThrow();
  }

  public childReady() {
    this.numChildrenNotReady--;

    if (this.numChildrenNotReady === 0) {
      const prevParents: ParentAtom[] = this.getParents();
      this.forgetParents();

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

enum SideEffectStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

type SideEffectState =
  | { status: SideEffectStatus.ACTIVE }
  | { status: SideEffectStatus.INACTIVE; dirty: boolean };

export class SideEffect {
  private readonly effect: Runnable;
  private readonly effectScheduler: IEffectScheduler;
  private readonly context: AtomTrackingContext;
  private numChildrenNotReady: number = 0;
  private state: SideEffectState = { status: SideEffectStatus.ACTIVE };

  constructor(
    effect: Runnable,
    context: AtomTrackingContext,
    effectScheduler: IEffectScheduler
  ) {
    this.effect = effect;
    this.context = context;
    this.effectScheduler = effectScheduler;
  }

  public run() {
    this.effectScheduler.schedule(this.runScoped);
  }

  private runScoped = (): void => {
    try {
      this.context.pushParent(this);
      this.effect();
    } finally {
      this.context.popParent();
    }
  };

  public childReady() {
    this.numChildrenNotReady--;

    if (this.numChildrenNotReady === 0) {
      switch (this.state.status) {
        case SideEffectStatus.ACTIVE:
          this.run();
          return;
        case SideEffectStatus.INACTIVE:
          this.state.dirty = true;
          return;
        default:
          throw new Error("invalid state");
      }
    }
  }

  public childDirty() {
    this.numChildrenNotReady++;
  }

  public activate() {
    if (this.state.status === SideEffectStatus.ACTIVE) {
      return;
    }

    if (this.state.dirty) {
      this.run();
    }

    this.state = { status: SideEffectStatus.ACTIVE };
  }

  public deactivate() {
    this.state = { status: SideEffectStatus.INACTIVE, dirty: false };
  }
}
