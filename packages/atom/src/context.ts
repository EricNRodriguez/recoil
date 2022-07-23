import { Maybe, IMaybe } from "typescript-monads";
import { DerivedAtom } from "./atom";

export class AtomTrackingContext {
  private static readonly instance: AtomTrackingContext =
    new AtomTrackingContext();
  private readonly scopeStack: DerivedAtom<any>[][] = [[]];

  public static getInstance(): AtomTrackingContext {
    return AtomTrackingContext.instance;
  }

  private getCurrentScope(): DerivedAtom<any>[] {
    return this.scopeStack[this.scopeStack.length - 1];
  }

  public getCurrentDerivation(): IMaybe<DerivedAtom<any>> {
    const currentScope: DerivedAtom<any>[] = this.getCurrentScope();

    if (currentScope.length === 0) {
      return Maybe.none<DerivedAtom<any>>();
    }

    return Maybe.some(currentScope[currentScope.length - 1]);
  }

  public pushDerivation(derivation: DerivedAtom<any>): void {
    this.getCurrentScope().push(derivation);
  }

  public popDerivation(): void {
    this.getCurrentScope().pop();
  }

  public enterNewTrackingContext(): void {
    this.scopeStack.push([]);
  }

  public exitCurrentTrackingContext(): void {
    if (this.scopeStack.length === 1) {
      // TODO(ericr): more clear message and type
      throw new Error("unable to exit the base context");
    }
    this.scopeStack.pop();
  }
}
