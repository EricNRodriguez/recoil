import {IMaybe} from "typescript-monads/src/maybe/maybe.interface";
import {Maybe} from "typescript-monads";
import {DerivedAtom} from "./atom.interface";

export class AtomContext {
    private callStack: DerivedAtom<any>[] = [];

    public getCurrentDerivation(): IMaybe<DerivedAtom<any>> {
        if (this.callStack.length === 0) {
            return Maybe.none<DerivedAtom<any>>();
        }

        return Maybe.some(
            this.callStack[this.callStack.length-1],
        );
    }

    public executeScopedDerivation<T>(atom: DerivedAtom<T>): T {
        this.callStack.push(atom);
        try {
            return atom.getUntracked();
        } finally {
            this.callStack.pop();
        }
    }
}