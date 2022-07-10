import {Maybe} from "typescript-monads";
import {IMaybe} from "typescript-monads/src/maybe/maybe.interface";
import {Atom, DerivedAtom, LeafAtom, SideEffect, SideEffectRef} from "./atom.interface";
import {Producer} from "./util.interface";
import {AtomContext} from "./context";
import {StatefulSideEffectError} from "./error";
import {WeakCollection} from "./weak_collection";

export const isAtom = (obj: any): boolean => {
	return obj instanceof Object && 'get' in obj && 'getUntracked' in obj && 'invalidate' in obj && 'react' in obj;
};

class SideEffectRegistry<T> {
	private readonly activeEffects: Set<SideEffect<T>> = new Set();
	private readonly inactiveEffects: Set<SideEffect<T>> = new Set();

	public registerEffect(effect: SideEffect<T>): SideEffectRef {
		if (this.activeEffects.has(effect) || this.inactiveEffects.has(effect)) {
			// TODO(ericr): use a more specific error
			throw new Error("duplicate registration of side effect");
		}

		this.activeEffects.add(effect);

		return {
			activate: () => this.activateEffect(effect),
			deactivate: () => this.deactivateEffect(effect),
		};
	}

	public hasActiveEffects(): boolean {
		return this.activeEffects.size !== 0;
	}

	public getActiveEffects(): SideEffect<T>[] {
		return Array.from(this.activeEffects);
	}

	private activateEffect(effect: SideEffect<T>): void {
		this.inactiveEffects.delete(effect);
		this.activeEffects.add(effect);
	}

	private deactivateEffect(effect: SideEffect<T>): void {
		this.activeEffects.delete(effect);
		this.inactiveEffects.add(effect);

		console.log(`deactivated effect: we now have ${this.activeEffects.size} active effects and ${this.inactiveEffects.size} inactive effects`);
	}
}

abstract class BaseAtom<T> implements Atom<T> {
	private static readonly context: AtomContext<DerivedAtomImpl<Object>> = new AtomContext<DerivedAtomImpl<Object>>();
	private readonly parents: WeakCollection<DerivedAtomImpl<Object>> = new WeakCollection<DerivedAtomImpl<Object>>();
	private readonly effects: SideEffectRegistry<T> = new SideEffectRegistry<T>();

	abstract get(): T;

	abstract getUntracked(): T;

	protected getParents(): DerivedAtomImpl<any>[] {
		return this.parents.getItems();
	}

	protected forgetParents(): void {
		this.parents.reset();
	}

	public invalidate(): void {
		this.parents.forEach((parent: DerivedAtomImpl<any>): void => {
			parent.dirty();
			parent.childReady();
		});
	}

	protected getContext(): AtomContext<DerivedAtomImpl<any>> {
		return BaseAtom.context;
	}

	public latchToCurrentDerivation(): void {
		this.getContext().getCurrentDerivation().tapSome(
			this.parents.register.bind(this.parents)
		);
	}

	public scheduleEffects(): void {
		if (!this.effects.hasActiveEffects()) {
			return;
		}

		// we want this to track, since the effects should be re-run whenever deps change
		const value: T = this.get();
		this.effects.getActiveEffects().forEach(
			(effect: SideEffect<T>) => effect(value),
		);
	}

	public react(effect: SideEffect<T>): SideEffectRef {
		const cachedEffect: SideEffect<T> = this.buildCachedEffect(effect);

		const ref = this.effects.registerEffect(cachedEffect);

		return {
			activate: () => {
				ref.activate();
				this.invalidate();
			},
			deactivate: () => {
				ref.deactivate();
			}
		}
	}

	private buildCachedEffect(effect: SideEffect<T>): SideEffect<T> {
		let prevValue: T | null = null;
		const cachedEffect: SideEffect<T> = (newValue: T): void => {
			if (newValue !== prevValue) {
				prevValue = newValue;
				effect(newValue);
			}
		};

		cachedEffect(this.get());

		return cachedEffect;
	}
}

export class LeafAtomImpl<T> extends BaseAtom<T> implements LeafAtom<T> {
	private value: T;

	constructor(value: T) {
		super();
		this.value = value;
	}

	public get(): T {
		this.latchToCurrentDerivation();
		return this.getUntracked();
	}

	public getUntracked(): T {
		return this.value;
	}

	public set(value: T) {
		this.checkSetIsNotASideEffect();

		if (value === this.value) {
			return;
		}

		this.value = value;

		// intentionally kicking AFTER setting, since
		// we want our effects to run with the new values
		this.dirty();
	}

	public dirty() {
		const prevParents: DerivedAtomImpl<any>[] = this.getParents();
		this.forgetParents();

		this.scheduleEffects();

		prevParents.forEach((parent: DerivedAtomImpl<any>): void => {
			parent.dirty();
			parent.childReady();
		});
	}

	private checkSetIsNotASideEffect(): void {
		if (this.getContext().getCurrentDerivation().isSome()) {
			throw new StatefulSideEffectError("stateful set called on leaf atom during derivation");
		}
	}
}

export class DerivedAtomImpl<T> extends BaseAtom<T> implements DerivedAtom<T> {
	private readonly deriveValue: Producer<T>;

	private value: IMaybe<T> = Maybe.none();
	private numChildrenNotReady: number = 0;

	constructor(deriveValue: Producer<T>) {
		super();
		this.deriveValue = deriveValue;
	}

	public get(): T {
		this.latchToCurrentDerivation();
		return this.executeScopedDerivation();
	}

	private executeScopedDerivation(): T {
		try {
			this.getContext().pushDerivation(this);
			return this.getUntracked();
		} finally {
			this.getContext().popDerivation();
		}
	}

	public getUntracked(): T {
		this.value = this.value.match({
			"none": (): IMaybe<T> => Maybe.some(this.deriveValue()),
			"some": (some: NonNullable<T>): IMaybe<T> => Maybe.some(some),
		});

		return this.value.valueOrThrow("value should be some after derivation");
	}

	public childReady() {
		this.numChildrenNotReady--;

		if (this.numChildrenNotReady === 0) {
			const prevParents: DerivedAtomImpl<any>[] = this.getParents();
			this.forgetParents();

			this.scheduleEffects();

			prevParents.forEach((parent: DerivedAtomImpl<any>): void => {
				parent.childReady();
			});
		}
	}

	public dirty() {
		this.discardCachedValue();

		if (this.numChildrenNotReady === 0) {
			this.getParents().forEach((parent: DerivedAtomImpl<any>): void => {
				parent.dirty();
			});
		}

		this.numChildrenNotReady++;
	}

	private discardCachedValue() {
		this.value = Maybe.none();
	}
}