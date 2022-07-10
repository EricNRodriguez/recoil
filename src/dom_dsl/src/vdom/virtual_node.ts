import {VNode} from "./virtual_node.interface";
import {runEffect, SideEffectRef} from "../../../atom";
import {Consumer} from "../../../atom/src/util.interface";
import {VElement} from "./virtual_element.interface";

export class VNodeImpl<T extends Node> implements VNode<Node> {
    private readonly node: T;
    private readonly rootEffects: Set<SideEffectRef> = new Set<SideEffectRef>();

    constructor(node: T) {
        this.node = node;
    }

    public registerEffect(effect: Consumer<T>): VNodeImpl<T> {
        const ref: SideEffectRef = runEffect((): void => effect(this.getRaw()));
        this.rootEffects.add(ref);
        return this;
    }

    public mount() {
        this.activateEffects();
    }

    public unmount() {
        this.deactivateEffects();
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

    public getRaw(): T {
        return this.node;
    }
}