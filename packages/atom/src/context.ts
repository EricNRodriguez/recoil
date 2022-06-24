import {IMaybe} from "typescript-monads/src/maybe/maybe.interface";
import {Maybe} from "typescript-monads";
import {Producer} from "./util.interface";
import {Atom} from "./atom.interface";

export class AtomContext {
    private callStack: Atom<any>[] = [];

    public getCurrentDerivation(): IMaybe<Atom<any>> {
        if (this.callStack.length === 0) {
            return Maybe.none<Atom<any>>();
        }

        return Maybe.some(
            this.callStack[this.callStack.length-1],
        );
    }

    public executeTrackedOp<T, O>(atom: Atom<T>, fn: Producer<O>): O {
        this.callStack.push(atom);
        try {
            return fn();
        } finally {
            this.callStack.pop();
        }
    }
}