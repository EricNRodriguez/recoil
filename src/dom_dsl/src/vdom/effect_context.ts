import {SideEffectRef} from "../../../atom";

export class EffectRegistry {
    // TODO(ericr): come back to this once the final design is fleshed out and determine if
    // holding onto strong refs here can cause leaks
    private readonly rootEffects: Set<SideEffectRef> = new Set<SideEffectRef>();

    public registerEffect(ref: SideEffectRef): void {
        this.rootEffects.add(ref);
    }

    public reset(): void {
        this.rootEffects.clear();
    }

    public mountContext(): void {
        this.activateEffects();
    }

    private activateEffects(): void {
        this.rootEffects.forEach((ref: SideEffectRef): void => {
            ref.activate();
        });
    }

    public unmountContext(): void {
        this.deactivateEffects();

    }

    private deactivateEffects(): void {
        this.rootEffects.forEach((ref: SideEffectRef): void => {
            ref.deactivate();
        });
    }
}