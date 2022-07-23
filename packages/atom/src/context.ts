import { Maybe, IMaybe } from "typescript-monads";

export type ParentAtom = {
  childDirty(): void;
  childReady(): void;
}

export class AtomTrackingContext {
  private static readonly instance: AtomTrackingContext =
    new AtomTrackingContext();
  private readonly scopeStack: ParentAtom[][] = [[]];

  public static getInstance(): AtomTrackingContext {
    return AtomTrackingContext.instance;
  }

  private getCurrentScope(): ParentAtom[] {
    return this.scopeStack[this.scopeStack.length - 1];
  }

  public getCurrentParent(): IMaybe<ParentAtom> {
    const currentScope: ParentAtom[] = this.getCurrentScope();

    if (currentScope.length === 0) {
      return Maybe.none<ParentAtom>();
    }

    return Maybe.some(currentScope[currentScope.length - 1]);
  }

  public pushParent(derivation: ParentAtom): void {
    this.getCurrentScope().push(derivation);
  }

  public popParent(): void {
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
