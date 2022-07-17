import {HtmlVNode} from "../vdom/virtual_node";
import {
    deregisterRunEffectDecorator,
    registerRunEffectDecorator,
    RunEffectDecorator,
    RunEffectSignature,
    SideEffectRef
} from "../../../atom";
import {Runnable} from "../../../util";

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

let currentCollector: EffectCollector | undefined = undefined;

export const createComponent = <T extends HtmlVNode>(fn: ComponentBuilder<T>): ComponentBuilder<T> => {
    const collectCreatedEffects: RunEffectDecorator = (runEffect: RunEffectSignature): RunEffectSignature => {
        return (rawEffect: Runnable): SideEffectRef => {
            const effect: SideEffectRef = runEffect(rawEffect);

            currentCollector?.collect(effect);

            return effect;
        };
    };

    return (...args: any[]): T => {
        try {
            var parentCollector: EffectCollector | undefined = currentCollector;
            currentCollector = new EffectCollector();

            registerRunEffectDecorator(collectCreatedEffects);

            const componentRoot: T = fn(...args);

            currentCollector.getEffects().forEach(ref => componentRoot.registerSideEffect(ref));

            return componentRoot;
        } finally {
            deregisterRunEffectDecorator(collectCreatedEffects);

            currentCollector = parentCollector;
        }
    };
};
