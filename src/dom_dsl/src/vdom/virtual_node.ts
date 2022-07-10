import {VNode} from "./virtual_node.interface";
import {SideEffectRef} from "../../../atom";

export class HtmlVNode<A extends Node, B extends HtmlVNode<A, B>> implements VNode<A, B> {
    private readonly node: A;
    private readonly rootEffects: Set<SideEffectRef> = new Set<SideEffectRef>();

    constructor(node: A) {
        this.node = node;
    }

    public registerEffect(ref: SideEffectRef): HtmlVNode<A, B> {
        this.rootEffects.add(ref);
        return this;
    }

    public mount(): HtmlVNode<A, B> {
        this.activateEffects();
        return this;
    }

    public unmount(): HtmlVNode<A, B> {
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