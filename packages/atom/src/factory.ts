import {AtomContext} from "./context";
import {Producer, Runnable} from "./util.interface";
import {LeafAtom, DerivedAtom, Atom} from "./atom.interface";
import {LeafAtomImpl, DerivedAtomImpl} from "./atom";
import {AtomFactory} from "./factory.interface";

export const buildFactory = (): AtomFactory => {
    return new AtomFactoryImpl();
};

class AtomFactoryImpl implements AtomFactory {
    private readonly context: AtomContext;

    constructor(context?: AtomContext) {
        this.context = context ?? new AtomContext();
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
        // kick it to trigger the eager evaluation, which
        // will in turn track any deps that the effect will run against
        atom.kick();
    }
}
