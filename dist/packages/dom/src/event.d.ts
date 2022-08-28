import { Consumer } from "utils";
export declare class GlobalEventCoordinator {
    private readonly eventTargets;
    private readonly targetHandlers;
    attachEventHandler<K extends keyof HTMLElementEventMap>(event: K, target: EventTarget, handler: Consumer<HTMLElementEventMap[K]>): void;
    detachEventHandlers<K extends keyof HTMLElementEventMap>(event: K, target: EventTarget): void;
    private executeHandlersBottomUp;
}
