import {AtomContext} from "./context";
import {Producer, Runnable} from "./util.interface";
import {LeafAtom, DerivedAtom} from "./atom.interface";
import {LeafAtomImpl, DerivedAtomImpl} from "./atom";
import {AtomFactory} from "./factory.interface";
import {Atom} from "./atom.interface";

export const buildFactory = (context?: AtomContext): AtomFactory => {
    return new AtomFactoryImpl(context)
};

class AtomFactoryImpl implements AtomFactory {
    private static readonly defaultGlobalAtomContext: AtomContext = new AtomContext();

    private readonly context: AtomContext;
    private readonly effectRefs: Set<Atom<any>> = new Set<Atom<any>>();

    constructor(context?: AtomContext) {
        this.context = context ?? AtomFactoryImpl.defaultGlobalAtomContext;
    }

    public buildAtom<T>(value: T): LeafAtom<T> {
        return new LeafAtomImpl(value, this.context);
    }

    public deriveAtom<T>(deriveValue: Producer<T>): DerivedAtom<T> {
        return new DerivedAtomImpl(deriveValue, this.context);
    }

    public createEffect(effect: Runnable): void {
        const atom: DerivedAtom<number> = this.deriveAtom((): number => {
            effect();
            return 0;
        });
        // we register a noop effect, which will cause the derived atom
        // to eagerly evaluate immediately after every dirty
        atom.react(() => {});
        // kick it to trigger the initial eager evaluation, which
        // will in turn track any deps that the effect will run against
        atom.get();

        // we want to keep this atom alive, and since the DAG only stores weak references,
        // we ensure that it is always in memory.
        //
        // without this, the effect may get collected, even when the atoms its dependent on
        // remain in memory
        this.effectRefs.add(atom);
    }
}
