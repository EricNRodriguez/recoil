import {AtomContext} from "./context";
import {Producer, Runnable} from "./util.interface";
import {LeafAtom, DerivedAtom} from "./atom.interface";
import {LeafAtomImpl, DerivedAtomImpl} from "./atom";
import {AtomFactory, Reference} from "./factory.interface";
import {Atom} from "./atom.interface";

export const buildFactory = (context?: AtomContext): AtomFactory => {
    return new AtomFactoryImpl(context)
};

class AtomFactoryImpl implements AtomFactory {
    private static readonly defaultGlobalAtomContext: AtomContext = new AtomContext();

    private readonly context: AtomContext;

    constructor(context?: AtomContext) {
        this.context = context ?? AtomFactoryImpl.defaultGlobalAtomContext;
    }

    public buildAtom<T>(value: T): LeafAtom<T> {
        return new LeafAtomImpl(value, this.context);
    }

    public deriveAtom<T>(deriveValue: Producer<T>): DerivedAtom<T> {
        return new DerivedAtomImpl(deriveValue, this.context);
    }

    public createEffect(effect: Runnable): Reference {
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

        // since the DAG edges are all weak, there is nothing keeping this atom
        // alive. Hence, the caller is responsible for keeping it in scope.
        return atom;
    }
}
