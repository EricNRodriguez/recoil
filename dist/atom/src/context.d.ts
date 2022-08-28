import { IMaybe } from "typescript-monads";
export declare type ParentAtom = {
    childDirty(): void;
    childReady(): void;
};
export declare class AtomTrackingContext {
    private readonly scopeStack;
    private getCurrentScope;
    getCurrentParent(): IMaybe<ParentAtom>;
    pushParent(derivation: ParentAtom): void;
    popParent(): void;
    enterNewTrackingContext(): void;
    exitCurrentTrackingContext(): void;
}
//# sourceMappingURL=context.d.ts.map