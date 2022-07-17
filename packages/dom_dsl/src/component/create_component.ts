import {HtmlVNode} from "../vdom/virtual_node";
import {
    registerDecorator,
    deregisterDecorator,
    SideEffectRef,
    RunEffectSignature, runEffect
} from "../../../atom";
import {Runnable} from "../../../util";
import {ApiFunctionDecorator} from "../../../atom/src/api";

class EffectCollector {
    private effects: Set<SideEffectRef> = new Set();

    public collect(effect: SideEffectRef): void {
        this.effects.add(effect);
    }

    public getEffects(): SideEffectRef[] {
        return Array.from(this.effects);
    }
}

export type ComponentBuilder<T extends HtmlVNode> = (...args: any[]) => T;

const collectorStack: EffectCollector[] = [];

export const createComponent = <T extends HtmlVNode>(fn: ComponentBuilder<T>): ComponentBuilder<T> => {
    const collectCreatedEffects: ApiFunctionDecorator<RunEffectSignature> = (runEffect: RunEffectSignature): RunEffectSignature => {
        return (rawEffect: Runnable): SideEffectRef => {
            const effect: SideEffectRef = runEffect(rawEffect);

            collectorStack[collectorStack.length-1].collect(effect);

            return effect;
        };
    };

    return (...args: any[]): T => {
        try {
            collectorStack.push(new EffectCollector());
            registerDecorator(runEffect, collectCreatedEffects);

            const componentRoot: T = fn(...args);

            collectorStack[collectorStack.length-1].getEffects().forEach(ref => componentRoot.registerSideEffect(ref));

            return componentRoot;
        } finally {
            deregisterDecorator(runEffect, collectCreatedEffects);
            collectorStack.pop();
        }
    };
};
