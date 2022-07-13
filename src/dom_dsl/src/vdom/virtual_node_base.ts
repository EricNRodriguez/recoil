import {VNode} from "./virtual_node.interface";
import {runEffect, SideEffectRef} from "../../../atom";
import {bindScope} from "../util/dom_utils";
import {Runnable} from "../../../atom/src/util.interface";

export abstract class VNodeBase<A, B extends VNodeBase<A,B>> implements VNode<A, B> {
    private readonly node: A;
    private readonly rootEffects: Set<SideEffectRef> = new Set<SideEffectRef>();
    private currentlyMounted: boolean = false;

    constructor(node: A) {
        this.node = node;
    }

    public registerSideEffect(effect: Runnable): VNodeBase<A, B> {
        // TODO(ericr): consider an optional arg to avoid eager eval... think it through
        const effectRef: SideEffectRef = runEffect((): void => {
            effect();
        });

        this.isMounted() ? effectRef.activate() : effectRef.deactivate();

        bindScope(
            this.getRaw(),
            effectRef
        );

        return this;
    }

    public isMounted(): boolean {
        return this.currentlyMounted;
    }

    public mount(): VNodeBase<A, B> {
        this.currentlyMounted = true;

        this.activateEffects();
        return this;
    }

    public unmount(): VNodeBase<A, B> {
        this.currentlyMounted = false;

        this.deactivateEffects();
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

    public getRaw(): A {
        return this.node;
    }
}
