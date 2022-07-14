import {LeafAtom, DerivedAtom, SideEffectRef} from "./atom.interface";
import {LeafAtomImpl, DerivedAtomImpl} from "./atom";
import {Atom} from "./atom.interface";
import {Supplier} from "../../dom_dsl/src/util.interface";
import {Consumer, Function, Runnable} from "./util.interface";
import {a, p} from "../../dom_dsl";
import {nullOrUndefined} from "../../dom_dsl/src/util/dom_utils";
// import {VNode} from "../../dom_dsl";
// import {Maybe} from "typescript-monads";
//
// // this is a wrapper that allows us to fetch resources from the UI but use them semi-synchronously
// export const fetchState = <T>(fn: AsyncProducer<T>): Atom<T | undefined> => { // think twice about exposing an external interface in your api...
//     const atom = createState<T | undefined>(undefined);
//
//     // this will trigger the atom to update
//     //
//     // should throw an error if it has a non-undefined value when it does resolve..., or we allow the caller to provide a default?
//     fn().then(atom.set.bind(atom));
//
//     return atom;
// }
//
// // this is the scope that the thing binds to
// let componentScope = new Scope(); // this will never go out of memory
//
// // NOTE: this shouldnt be here at all.... this wrapper should be inside the dom dsl module.
// export const createComponent = (fn: any): any => {
//     return (...args: any): any => {
//         const outerComponentScope = componentScope;
//         componentScope = new ComponentScope();
//
//         const component = fn(...args);
//
//         for all resources binded to componentScope.getResources()
//             bind them to component.getRaw()
//
//         componentScope = outerComponentScope;
//         return component;
//     };
// };

class Scope {
    private objects: Set<Object> = new Set<Object>();

    public collect(object: Object): void {
        this.objects.add(object);
    }

    public forEach(fn: Consumer<Object>): void {
        this.objects.forEach(fn);
    }
}

// TODO(ericr): The root level scope NEVER gets collected, so it is important that this is documented
// clearly in the public API - more so now that autoScope defaults to true!
let currentScope: Scope = new Scope();

// decorates the provided function such that all auto-scoped atoms and effects created within will
// life for at-least as long as the return value
export const createScope = <F extends (...args: any[]) => O, O extends Object>(fn: F): F => {
    const privateProperty: string = '$$$recoilWithScopeDependant';

    return <F>((...args: any[]): O => {
        const parentScope = currentScope;
        currentScope = new Scope();

        try {
            var returnVal: O = fn(...args);
        } finally {
            currentScope = parentScope;
        }

        if (nullOrUndefined(returnVal)) {
            // TODO(ericr): use a more specific error type
            throw new Error("withScope expects a return value that is neither null or undefined");
        }

        if (!returnVal.hasOwnProperty(privateProperty)) {
            (returnVal as any)[privateProperty] = [];
        }

        currentScope!.forEach((object: Object): void => {
            (returnVal as any)[privateProperty].push(object);
        });

        return returnVal;
    });
}

export type CreateStateArgs<T> = {
    value: T,
    autoScope?: boolean,
}

export const createState = <T>({value, autoScope = true}: CreateStateArgs<T>): LeafAtom<T> => {
    const atom: LeafAtom<T> = new LeafAtomImpl(value);

    if (autoScope) {
        currentScope.collect(atom);
    }

    return atom;
};


export type DeriveStateArgs<T> = {
    deriveValue: Supplier<T>,
    autoScope?: boolean,
}

export const deriveState = <T>({deriveValue, autoScope = true}: DeriveStateArgs<T>): Atom<T> => {
    const atom: Atom<T> = new DerivedAtomImpl(deriveValue);

    if (autoScope) {
        currentScope.collect(atom);
    }

    return atom;
}


export type RunEffectArgs = {
    effect: Runnable,
    autoScope?: boolean,
}

export const runEffect = ({effect, autoScope = true}: RunEffectArgs): SideEffectRef => {
    const atom: DerivedAtom<number> = deriveState<number>({
        deriveValue: () => {
            effect();
            return 0;
        },
        autoScope: false,
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

    if (autoScope) {
        currentScope.collect(sideEffectRef);
    }

    return sideEffectRef;
};
