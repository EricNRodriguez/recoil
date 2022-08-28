"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalEventCoordinator = void 0;
const utils_1 = require("../../utils");
class GlobalEventCoordinator {
    eventTargets = new Map();
    targetHandlers = new WeakMap();
    // registers a delegated event handler on the target. Bubbling is
    // simulated, with support for events dispatched by nodes within a shadow
    // dom.
    attachEventHandler(event, target, handler) {
        if (!this.eventTargets.has(event)) {
            this.eventTargets.set(event, new WeakSet());
            document.addEventListener(event, (this.executeHandlersBottomUp));
        }
        this.eventTargets.get(event).add(target);
        if (!this.targetHandlers.has(target)) {
            this.targetHandlers.set(target, []);
        }
        this.targetHandlers.get(target).push({
            event: event,
            handler: handler,
        });
        return;
    }
    detachEventHandlers(event, target) {
        this.eventTargets.get(event)?.delete(target);
        this.targetHandlers.set(target, this.targetHandlers.get(target)?.filter((r) => r.event === event) ?? []);
    }
    // simulates event bubbling
    executeHandlersBottomUp = (event) => {
        if (!event.bubbles) {
            throw new Error("delegated events should only be those that bubble");
        }
        let curTarget = event.composedPath()[0];
        let target = curTarget;
        Object.defineProperty(event, "target", { get: () => target });
        Object.defineProperty(event, "currentTarget", { get: () => curTarget });
        // bubble bottom-up - we are traversing the ll manually due to the composedPath
        // not always containing the complete list of nodes (specifically, closed shadow dom nodes)
        while ((0, utils_1.notNullOrUndefined)(curTarget) && !event.cancelBubble) {
            if (this.eventTargets.get(event.type)?.has(curTarget) ?? false) {
                this.targetHandlers.get(curTarget)?.forEach((h) => {
                    h.event === event.type && h.handler(event);
                });
            }
            // https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/host
            if ((0, utils_1.notNullOrUndefined)(curTarget?.host) &&
                curTarget.host instanceof Node) {
                // https://developer.mozilla.org/en-US/docs/Web/API/Event/composed
                curTarget = event.composed ? curTarget.host : null;
                // since we have crossed a shadow dom boundary, we need to reset target to the shadow dom host node
                target = curTarget;
            }
            else {
                curTarget = curTarget.parentNode;
            }
        }
        return;
    };
}
exports.GlobalEventCoordinator = GlobalEventCoordinator;
//# sourceMappingURL=event.js.map