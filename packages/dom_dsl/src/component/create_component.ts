import {HtmlVNode} from "../vdom/virtual_node";

export type ComponentBuilder<T extends HtmlVNode> = (...args: any[]) => T;

export const createComponent = <T extends HtmlVNode>(fn: ComponentBuilder<T>): ComponentBuilder<T> => {
    return (...args: any[]): T => {
        return fn(...args);
    };
};
