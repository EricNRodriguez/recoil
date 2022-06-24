import {Maybe} from "typescript-monads";
import {IMaybe} from "typescript-monads/src/maybe/maybe.interface";
import {Atom, DerivedAtom, LeafAtom} from "./atom.interface";
import {Consumer, Producer} from "./util.interface";
import {AtomContext} from "./context";

abstract class BaseAtom<T> implements Atom<T> {
	private readonly effects: Consumer<T>[] = [];
	private dependants: WeakRef<DerivedAtom<any>>[] = [];
	private readonly context: AtomContext;

	protected constructor(context: AtomContext) {
		this.context = context;
	}

	abstract get(): T;

	public getContext(): AtomContext {
		return this.context;
	}

	public registerDependant(dependant: DerivedAtom<any>): void {
		const dependantRef: WeakRef<DerivedAtom<any>> = new WeakRef<DerivedAtom<any>>(dependant);
		if (!this.dependants.includes(dependantRef)) {
			this.dependants.push(dependantRef);
		}
	}

	// kick:
	// -> dirty all deps
	// -> ignore them
	// -> re-derive if there are effects
	public kick(): void {
		this.dirtyAllDependants();
		this.unlatch();

		this.scheduleEffects();
	}

	// we need to be very careful here, since we can easily end up
	// spamming effects...
	//
	// the solution is to schedule them to happen AFTER the call stack goes to zero
	//
	// but what happens if those effects cause derivations, which in turn cause more effects?
	//
	// wait... derivations dont cause effects, only sets do...
	//
	// laziness is transparent
	//
	// think this through...
	// TODO(ericr): think this through - should we wait until the graph is stable? I dont think so, since
	// we only react to sets.. so this should be ok??? Need to test...
	private scheduleEffects(): void {
		if (this.effects.length === 0) {
			return;
		}

		const value: T = this.get();
		this.effects.forEach(
			(effect: Consumer<T>) => effect(value),
		);
	}

	private dirtyAllDependants(): void {
		this.applyToDependants(
			(dependant: DerivedAtom<any>) => dependant.kick(),
		);
	}

	private unlatch(): void {
		this.dependants = [];
	}

	private applyToDependants(apply: Consumer<DerivedAtom<any>>): void {
		this.removeGCdDependants();
		this.dependants.forEach(d => apply(d.deref()));
	}

	private removeGCdDependants(): void {
		this.dependants = this.dependants.filter(
			(dependantRef: WeakRef<DerivedAtom<any>>) => dependantRef.deref() !== undefined
		)
	}

	public react(effect: Consumer<T>): void {
		this.effects.push(effect);
	}
}

export class LeafAtomImpl<T> extends BaseAtom<T> implements LeafAtom<T> {
	private value: T = null;

	constructor(value: T, context: AtomContext) {
		super(context);
		this.value = value;
	}

	public get(): T {
		this.getContext().getCurrentDerivation().tapSome(this.registerDependant.bind(this));
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
		this.getContext().getCurrentDerivation().tapSome(this.registerDependant.bind(this));

		return this.getContext().executeTrackedOp(
			this,
			() => this.getUntracked(),
		);
	}

	private getUntracked(): T {
		if (this.value.isNone()) {
			this.value = Maybe.some(this.deriveValue());
		}

		return this.value.valueOrThrow("value should be some after derivation");
	}

}