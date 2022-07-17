import {HtmlVNode} from "../vdom/virtual_node";
import {
    deregisterRunEffectDecorator,
    registerRunEffectDecorator,
    RunEffectDecorator,
    RunEffectSignature,
    SideEffectRef
} from "../../../atom";
import {Runnable} from "../../../util";

export type ComponentBuilder<T extends HtmlVNode> = (...args: any[]) => T;

export const createComponent = <T extends HtmlVNode>(fn: ComponentBuilder<T>): ComponentBuilder<T> => {
    const collectCreatedEffects: RunEffectDecorator = (runEffect: RunEffectSignature): RunEffectSignature => {
        return (rawEffect: Runnable): SideEffectRef => {
            return runEffect(rawEffect);
        };
    };

    return (...args: any[]): T => {
        try {
            registerRunEffectDecorator(collectCreatedEffects);
            return fn(...args);
        } finally {
            deregisterRunEffectDecorator(collectCreatedEffects);
        }

    };
};
