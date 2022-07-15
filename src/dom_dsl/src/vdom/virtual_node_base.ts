import {VNode} from "./virtual_node.interface";
import {runEffect, SideEffectRef} from "../../../atom";
import {Runnable} from "../../../atom/src/util.interface";

export abstract class VNodeBase<A, B extends VNodeBase<A,B>> implements VNode<A, B> {
    private readonly node: A;
    private readonly rootEffects: Set<SideEffectRef> = new Set<SideEffectRef>();
    private readonly onMountHooks: Set<Runnable> = new Set<Runnable>;
    private readonly onUnmountHooks: Set<Runnable> = new Set<Runnable>;
    private currentlyMounted: boolean = false;

    constructor(node: A) {
        this.node = node;
    }

    // registers an effect that should be activated/deactivated as the
    // element is mounted/unmounted from the dom.
    //
    // registration should be treated as a change of ownership of the effect
    public registerSideEffect(effect: Runnable): VNodeBase<A, B> {
        // TODO(ericr): consider an optional arg to avoid eager eval... think it through
        const effectRef: SideEffectRef = runEffect({
            effect: (): void => {
                effect();
            },
            autoScope: false,
        });
        this.rootEffects.add(effectRef);

        this.isMounted() ? effectRef.activate() : effectRef.deactivate();

        return this;
    }

    public isMounted(): boolean {
        return this.currentlyMounted;
    }

    public mount(): VNodeBase<A, B> {
        this.currentlyMounted = true;

        this.activateEffects();
        this.runMountHooks();
        return this;
    }

    public unmount(): VNodeBase<A, B> {
        this.currentlyMounted = false;

        this.deactivateEffects();
        this.runUnmountHooks();
        return this;
    }

    private activateEffects(): void {
        this.rootEffects.forEach((ref: SideEffectRef): void => {
            ref.activate();
        });
    }

    private deactivateEffects(): void {
        this.rootEffects.forEach((ref: SideEffectRef): void => {
            ref.deactivate();
        });
    }

    private runUnmountHooks(): void {
        this.onUnmountHooks.forEach(hook => hook());
    }

    private runMountHooks(): void {
        this.onMountHooks.forEach(hook => hook());
    }

    public registerOnMountHook(hook: Runnable): VNodeBase<A, B> {
        this.onMountHooks.add(hook);
        return this;
    }

    public registerOnUnmountHook(hook: Runnable): VNodeBase<A, B> {
        this.onUnmountHooks.add(hook);
        return this;
    }

    public getRaw(): A {
        return this.node;
    }
}
