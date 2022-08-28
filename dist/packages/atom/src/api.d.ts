import { ILeafAtom, ISideEffectRef } from "./atom.interface";
import { IAtom } from "./atom.interface";
import { Producer, Runnable } from "../../utils";
/**
 * A generic higher order function
 */
export declare type FunctionDecorator<F extends Function> = (fn: F) => F;
/**
 * Registers a runtime decorator against one of the public factory methods exposed by this module.
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be applied for all subsequent calls of the apiFn
 */
export declare const registerDecorator: <F extends Function>(apiFn: F, decorator: FunctionDecorator<F>) => void;
/**
 * De-registers decorators that have been applied to the provided apiFn (i.e. createState etc)
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be removed
 */
export declare const deregisterDecorator: <F extends Function>(apiFn: F, decorator: FunctionDecorator<F>) => void;
export declare type FetchStateSignature<T> = (fetch: () => Promise<T>) => IAtom<T | undefined>;
/**
 * A lightweight primitive that allows state to be fetched asynchronously and written to a reactive atom. Before
 * resolving, the returned atom will have an undefined value.
 *
 * @param producer A synchronous builder for an asynchronous value. It is important that all dependencies that invalidate
 *                 the returned state are read synchronously (i.e. before any async execution). You should think of this
 *                 as a synchronous factory that produces a promise, with this factory being re-run every time its dependencies
 *                 change.
 * @returns A maybe atom containing the fetched state (or undefined in the instance when the state is being fetched)
 */
export declare const fetchState: <T>(producer: Producer<Promise<T>>) => IAtom<T | undefined>;
export declare type CreateStateSignature<T> = (value: T) => ILeafAtom<T>;
/**
 * A factory method for a leaf atom instance.
 *
 * @param value The value to be stored in the atom.
 * @returns The atom
 */
export declare const createState: <T>(value: T) => ILeafAtom<T>;
export declare type DeriveStateSignature<T> = (derivation: () => T) => IAtom<T>;
/**
 * A factory method for a derived state.
 *
 * The returned atom is dirtied whenever any atomic dependencies used within the
 * derivation are dirtied. Evaluation can either be lazy or eager, depending on
 * the effects registered against it.
 *
 * Which computations to wrap in cached derivations should be considered carefully, ideally through profiling. This
 * is because all writes to leaf atoms have a linear time complexity on the depth of the dependency DAG. Hence,
 * they should be used as tracked cache (memoization) primitive.
 *
 * @param deriveValue A synchronous factory for the state
 * @param cache Determines if the returned Atom is a skip connection in the DAG or an actual node.
 * @returns An atom containing the derived state, which automatically tracks the dependencies that were used to
 *          create it
 */
export declare const deriveState: <T>(deriveValue: Producer<T>, cache?: boolean) => IAtom<T>;
export declare type RunEffectSignature = (effect: Runnable) => ISideEffectRef;
/**
 * A factory method for a tracked side effect
 *
 * The effect will be eagerly run once, and again any time any of its dependencies become dirty.
 *
 * It is important that this side effect is state-free, i.e. writes to atoms should be done with extreme
 * caution, as they can easily create reactive loops that are extremely difficult to find.
 *
 * As this is effectively a leaf in the dependency DAG, a reference to the side effect is returned that
 * should be managed by the caller. It provides lifecycle methods for the effect and also ensures that the
 * effect is not garbage collected. Despite this, it is recommended that this function should be decorated with
 * auto-scoping logic that handles reference management instead of doing it ad-hoc.
 *
 * @param effect The side effect
 * @returns A reference to the side effect (see the above doc)
 */
export declare const runEffect: RunEffectSignature;
/**
 * A utility decorator that auto-wraps instance variables in atoms, and overrides the set and get methods
 * such that they write/read to the atom.
 */
export declare const state: () => void | any;
/**
 * A utility decorator that auto-wraps methods in derived atoms.
 */
export declare const derivedState: () => string | any;
/**
 * Executes a callback that is not tracked by external contexts. I.e. reads made within the callback
 * will be made outside any external tracking scopes.
 *
 * @param job The callback to execute in an untracked context
 */
export declare const runUntracked: <T>(job: Producer<T>) => T;
/**
 * Executes a job in a batched context, such that all eager side effects will be run after the job returns.
 * This is typically useful if you have an invalid intermediate state that is invalid and should never be used
 * in any effects.
 *
 * @param job The job to be run in a batched state, with all effects running after the job completes.
 */
export declare const runBatched: (job: Runnable) => void;
