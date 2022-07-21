import { Maybe, IMaybe } from "typescript-monads";
import { DerivedAtom } from "./atom.interface";

export class AtomContext<T extends DerivedAtom<Object>> {
  private callStack: T[] = [];

  public getCurrentDerivation(): IMaybe<T> {
    if (this.callStack.length === 0) {
      return Maybe.none<T>();
    }

    return Maybe.some(this.callStack[this.callStack.length - 1]);
  }

  public pushDerivation(derivation: T): void {
    this.callStack.push(derivation);
  }

  public popDerivation(): void {
    this.callStack.pop();
  }
}
