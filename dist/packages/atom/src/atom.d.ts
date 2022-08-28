import { IAtom, ILeafAtom } from "./atom.interface";
import { AtomTrackingContext, ParentAtom } from "./context";
import { Producer, Runnable, Function, Supplier } from "../../utils";
export declare const isAtom: (obj: any) => boolean;
declare abstract class BaseAtom<T> implements IAtom<T> {
    private readonly context;
    private readonly parents;
    protected constructor(context: AtomTrackingContext);
    abstract get(): T;
    abstract getUntracked(): T;
    protected getParents(): ParentAtom[];
    protected forgetParents(): void;
    invalidate(): void;
    protected getContext(): AtomTrackingContext;
    latchToCurrentDerivation(): void;
    map<R>(mutation: Function<T, R>): IAtom<R>;
}
export interface IEffectScheduler {
    schedule(effect: Runnable): void;
}
export declare class LeafAtomImpl<T> extends BaseAtom<T> implements ILeafAtom<T> {
    private value;
    constructor(value: T, context: AtomTrackingContext);
    get(): T;
    getUntracked(): T;
    set(value: T): void;
    update(fn: (val: T) => T): void;
    dirty(): void;
    private checkSetIsNotASideEffect;
}
/**
 * A derivation that is logically a node in the DAG, but is actually just a virtual node - the runtime graph
 * has no knowledge of it.
 */
export declare class VirtualDerivedAtom<T> implements IAtom<T> {
    private readonly context;
    private readonly derivation;
    private readonly tracker;
    constructor(context: AtomTrackingContext, derivation: Supplier<T>);
    get(): T;
    getUntracked(): T;
    invalidate(): void;
    map<R>(transform: Function<T, R>): IAtom<R>;
}
export declare class DerivedAtom<T> extends BaseAtom<T> {
    private readonly deriveValue;
    private value;
    private numChildrenNotReady;
    constructor(deriveValue: Producer<T>, context: AtomTrackingContext);
    get(): T;
    private executeScopedDerivation;
    getUntracked(): T;
    childReady(): void;
    childDirty(): void;
    private discardCachedValue;
}
export declare class SideEffect {
    private readonly effect;
    private readonly effectScheduler;
    private readonly context;
    private numChildrenNotReady;
    private state;
    constructor(effect: Runnable, context: AtomTrackingContext, effectScheduler: IEffectScheduler);
    run(): void;
    private runScoped;
    childReady(): void;
    childDirty(): void;
    activate(): void;
    deactivate(): void;
}
export {};
