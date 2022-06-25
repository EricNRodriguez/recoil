import {Maybe} from "typescript-monads";
import {IMaybe} from "typescript-monads/src/maybe/maybe.interface";
import {Atom, DerivedAtom, LeafAtom, SideEffect} from "./atom.interface";
import {Consumer, Producer} from "./util.interface";
import {AtomContext} from "./context";

class DependantAtomCollection {
	private dependants: WeakRef<DerivedAtom<any>>[] = [];
	private dependantSet: WeakSet<DerivedAtom<any>> = new WeakSet([]);

	public register(dependant: DerivedAtom<any>): void {
		if (this.dependantSet.has(dependant)) {
			return;
		}

		const dependantRef: WeakRef<DerivedAtom<any>> = new WeakRef<DerivedAtom<any>>(dependant);
		this.dependantSet.add(dependant);
		this.dependants.push(dependantRef);
	}

	public reset() {
		this.dependants.forEach((dependantRef: WeakRef<DerivedAtom<any>>): void => {
			const dependant: DerivedAtom<any> | undefined = dependantRef.deref();
			if (dependant !== undefined) {
				this.dependantSet.delete(dependant);
			}
		});
		this.dependants = [];
	}

	public forEach(consumer: Consumer<DerivedAtom<any>>): void {
		this.dependants.forEach((dependantRef: WeakRef<DerivedAtom<any>>): void => {
			const atom: DerivedAtom<any> | undefined = dependantRef.deref();
			if (atom !== undefined) {
				consumer(atom);
			}
		});
		this.removeGCdDependants();
	}

	private removeGCdDependants(): void {
		this.dependants = this.dependants.filter(
			(dependantRef: WeakRef<DerivedAtom<any>>) => dependantRef.deref() !== undefined
		)
	}
}

abstract class BaseAtom<T> implements Atom<T> {
	private readonly dependants: DependantAtomCollection = new DependantAtomCollection();
	private readonly effects: SideEffect<T>[] = [];
	private readonly context: AtomContext;


	protected constructor(context: AtomContext) {
		this.context = context;
	}

	abstract get(): T;

	abstract getUntracked(): T;

	public getContext(): AtomContext {
		return this.context;
	}

	public latchToCurrentDerivation(): void {
		this.getContext().getCurrentDerivation().tapSome(
			this.dependants.register.bind(this.dependants)
		);
	}

	public kick(): void {
		this.dirtyAllDependants();
		this.dependants.reset();
		this.scheduleEffects();
	}

	private scheduleEffects(): void {
		if (this.effects.length === 0) {
			return;
		}

		// we want this to track, since the effects should be re-run whenever deps change
		const value: T = this.get();
		this.effects.forEach(
			(effect: SideEffect<T>) => effect(value),
		);
	}

	private dirtyAllDependants(): void {
		this.dependants.forEach(
			(dependant: DerivedAtom<any>) => dependant.kick(),
		);
	}

	public react(effect: SideEffect<T>): void {
		const cachedEffect: SideEffect<T> = this.buildCachedEffect(effect);
		cachedEffect(this.get());
		this.effects.push(cachedEffect);
	}

	private buildCachedEffect<T>(effect: SideEffect<T>): SideEffect<T> {
		let prevValue: T | null = null;
		return (newValue: T): void => {
			if (newValue !== prevValue) {
				prevValue = newValue;
				effect(newValue);
			}
		};
	}
}

export class LeafAtomImpl<T> extends BaseAtom<T> implements LeafAtom<T> {
	private value: T;

	constructor(value: T, context: AtomContext) {
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

	public set(value: T) {
		if (value === this.value) {
			return;
		}

		this.value = value;

		// intentionally kicking AFTER setting, since
		// we want our effects to run with the new values
		this.kick();
	}
}

export class DerivedAtomImpl<T> extends BaseAtom<T> implements DerivedAtom<T> {
	private value: IMaybe<T> = Maybe.none();
	private readonly deriveValue: Producer<T>;

	constructor(deriveValue: Producer<T>, context: AtomContext) {
		super(context);
		this.deriveValue = deriveValue;
	}

	public get(): T {
		this.latchToCurrentDerivation();
		return this.getContext().executeScopedDerivation(this);
	}

	public getUntracked(): T {
		if (this.value.isNone()) {
			this.value = Maybe.some(this.deriveValue());
		}

		return this.value.valueOrThrow("value should be some after derivation");
	}

	public kick() {
		this.discardCachedValue();
		super.kick();
	}

	private discardCachedValue() {
		this.value = Maybe.none();
	}
}