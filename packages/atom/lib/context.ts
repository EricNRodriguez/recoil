import { Maybe, IMaybe } from "typescript-monads";
import { IAtom } from "./atom.interface";

export type ParentAtom = {
  childDirty(): void;
  childReady(): void;
  registerChild(child: IAtom<any>): void;
  forgetChild(child: IAtom<any>): void;
};

export class AtomTrackingContext {
  private readonly scopeStack: ParentAtom[][] = [[]];

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
      throw new Error("unable to exit the base component");
    }
    this.scopeStack.pop();
  }
}
