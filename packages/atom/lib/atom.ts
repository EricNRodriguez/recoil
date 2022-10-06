import { Maybe, IMaybe } from "typescript-monads";
import { IAtom, IMutableAtom } from "./atom.interface";
import { AtomTrackingContext, ParentAtom } from "./context";
import { StatefulSideEffectError } from "./error";
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
  protected readonly parents: Set<ParentAtom> = new Set();
  protected readonly updateExecutor: IUpdateExecutor;

  protected constructor(
    context: AtomTrackingContext,
    updateExecutor: IUpdateExecutor
  ) {
    this.context = context;
    this.updateExecutor = updateExecutor;
  }

  abstract get(): T;

  abstract getUntracked(): T;

  public forgetParent(parent: ParentAtom): void {
    this.parents.delete(parent);
  }

  protected getParents(): ParentAtom[] {
    return Array.from(this.parents);
  }

  protected forgetParents(): void {
    this.parents.forEach((p) => p.forgetChild(this));
    this.parents.clear();
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
    // this -> parent
    this.getContext()
      .getCurrentParent()
      .tapSome(this.parents.add.bind(this.parents));

    // parent -> this
    this.getContext()
      .getCurrentParent()
      .tapSome((parent: ParentAtom) => parent.registerChild(this));
  }

  public map<R>(mutation: Function<T, R>): IAtom<R> {
    return new VirtualDerivedAtom(
      this.context,
      () => mutation(this.get()),
      this.updateExecutor
    );
  }
}

export interface IEffectScheduler {
  schedule(effect: Runnable, priority: number): void;
}

export interface IUpdateExecutor {
  executeAtomicUpdate(job: Runnable): void;
}

export class MutableAtom<T> extends BaseAtom<T> implements IMutableAtom<T> {
  private value: T;

  constructor(
    value: T,
    context: AtomTrackingContext,
    updateExecutor: IUpdateExecutor
  ) {
    super(context, updateExecutor);
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

    // wrapping the update in a callback allows us to
    // delegate all effect-related logic to the executor
    this.updateExecutor.executeAtomicUpdate(() => {
      this.value = value;

      // intentionally kicking AFTER setting, since
      // we want our effects to run with the new values
      this.dirty();
    });
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
  private readonly updateExecutor: IUpdateExecutor;

  constructor(
    context: AtomTrackingContext,
    derivation: Supplier<T>,
    updateExecutor: IUpdateExecutor
  ) {
    this.context = context;
    this.derivation = derivation;
    this.tracker = new MutableAtom(false, context, updateExecutor);
    this.updateExecutor = updateExecutor;
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
    return new VirtualDerivedAtom(
      this.context,
      () => transform(this.get()),
      this.updateExecutor
    );
  }
}

export class DerivedAtom<T> extends BaseAtom<T> {
  private readonly deriveValue: Producer<T>;
  private readonly children: Set<IAtom<any>> = new Set();

  private value: IMaybe<T> = Maybe.none();
  private numChildrenNotReady: number = 0;

  constructor(
    deriveValue: Producer<T>,
    context: AtomTrackingContext,
    updateExecutor: IUpdateExecutor
  ) {
    super(context, updateExecutor);
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

  public registerChild(child: IAtom<any>): void {
    this.children.add(child);
  }

  public forgetChild(child: IAtom<any>): void {
    this.children.delete(child);
  }

  public forgetParent(parent: ParentAtom) {
    super.forgetParent(parent);
    if (this.getParents().length === 0) {
      this.parents.forEach((p) => p.forgetChild(this));
      this.children.forEach((c) => (c as BaseAtom<any>).forgetParent(this));
      this.parents.clear();
      this.children.clear();

      /*
       * We need to throw away the value since we are now disconnected from the DAG, with no way of being told if
       * it is dirty or not.
       *
       * This may be problematic for particularly expensive derivations, so more involved caching strategies
       * might be appropriate - not sure just yet.
       */
      this.discardCachedValue();
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
  | { status: SideEffectStatus.ACTIVE, children: Set<BaseAtom<any>> }
  | { status: SideEffectStatus.INACTIVE };

export class SideEffect {
  private readonly effect: Runnable;
  private readonly priority: number;
  private readonly effectScheduler: IEffectScheduler;
  private readonly context: AtomTrackingContext;
  private numChildrenNotReady: number = 0;
  private state: SideEffectState = { status: SideEffectStatus.ACTIVE, children: new Set() };

  constructor(
    effect: Runnable,
    context: AtomTrackingContext,
    effectScheduler: IEffectScheduler,
    priority: number
  ) {
    this.effect = effect;
    this.context = context;
    this.effectScheduler = effectScheduler;
    this.priority = priority;
  }

  public forgetChild(child: IAtom<any>): void {
    if (this.state.status === SideEffectStatus.ACTIVE) {
      this.state.children.delete(child as BaseAtom<any>);
    }
  }

  public registerChild(child: IAtom<any>): void {
    if (this.state.status === SideEffectStatus.INACTIVE) {
      throw new Error("SideEffect in a bad state : registerChild called on inactive side effect");
    }

    this.state.children.add(child as BaseAtom<any>);
  }

  public run() {
    this.effectScheduler.schedule(this.runScoped, this.priority);
  }

  private runScoped = (): void => {
    /*
      Effects may have been scheduled before becoming inactive, but run after another effect that renders them inactive,
      so this sc needs to exist at this level as a last resort, since re-executing will re-track dependencies and
      introduce memory leaks.
     */
    if (this.state.status === SideEffectStatus.INACTIVE) {
      return;
    }

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
          throw new Error("SideEffect in a bad state : inactive effects should be dangling");
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

    this.state = { status: SideEffectStatus.ACTIVE, children: new Set() };
    this.run();
  }

  public deactivate() {
    if (this.state.status === SideEffectStatus.INACTIVE) {
      return;
    }

    this.state.children.forEach((c) => c.forgetParent(this));
    this.state.children.clear();
    this.state = { status: SideEffectStatus.INACTIVE};
  }
}
