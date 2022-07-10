import {LeafAtom, DerivedAtom, SideEffectRef} from "./atom.interface";
import {LeafAtomImpl, DerivedAtomImpl} from "./atom";
import {Atom} from "./atom.interface";
import {Supplier} from "../../dom_dsl/src/util.interface";
import {Runnable} from "./util.interface";

export const createState = <T>(value: T): LeafAtom<T> => new LeafAtomImpl(value);

export const deriveState = <T>(deriveValue: Supplier<T>): Atom<T> => new DerivedAtomImpl(deriveValue);

export const runEffect = (effect: Runnable): SideEffectRef => {
    const atom: DerivedAtom<number> = deriveState<number>(() => {
        effect();
        return 0;
    });
    // we register a noop effect, which will cause the derived atom
    // to eagerly evaluate immediately after every dirty
    const sideEffectRef: SideEffectRef = atom.react(() => {});

    // // kick it to trigger the initial eager evaluation, which
    // // will in turn track any deps that the effect will run against
    atom.get();

    // since the DAG edges are all weak, there is nothing keeping this atom
    // alive. Hence, the caller is responsible for keeping it in scope by
    // keeping the ref in scope.
    //
    // This should probably be done through a registry but for now its fine
    (sideEffectRef as any).$$$recoilParentDerivedAtom = atom;

    return sideEffectRef;
};
