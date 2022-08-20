import { Consumer, notNullOrUndefined } from "../../../util";

type EventHandlerRef = {
  event: keyof HTMLElementEventMap;
  handler: Consumer<any>;
};

export class GlobalEventCoordinator {
  private readonly eventTargets: Map<string, WeakSet<EventTarget>> = new Map();
  private readonly targetHandlers: WeakMap<EventTarget, EventHandlerRef[]> =
    new WeakMap();

  // registers a delegated event handler on the target. Bubbling is
  // simulated, with support for events dispatched by nodes within a shadow
  // dom.
  public attachEventHandler<K extends keyof HTMLElementEventMap>(
    event: K,
    target: EventTarget,
    handler: Consumer<HTMLElementEventMap[K]>
  ): void {
    if (!this.eventTargets.has(event)) {
      this.eventTargets.set(event, new WeakSet());
      document.addEventListener(event, this.executeHandlersBottomUp<K>);
    }

    this.eventTargets.get(event)!.add(target);
    if (!this.targetHandlers.has(target)) {
      this.targetHandlers.set(target, []);
    }
    this.targetHandlers.get(target)!.push({
      event: event,
      handler: handler,
    });

    return;
  }

  public detachEventHandlers<K extends keyof HTMLElementEventMap>(
    event: K,
    target: EventTarget
  ): void {
    this.eventTargets.get(event)?.delete(target);
    this.targetHandlers.set(
      target,
      this.targetHandlers.get(target)?.filter((r) => r.event === event) ?? []
    );
  }

  // simulates event bubbling
  private executeHandlersBottomUp = <K extends keyof HTMLElementEventMap>(
    event: HTMLElementEventMap[K]
  ): void => {
    if (!event.bubbles) {
      throw new Error("delegated events should only be those that bubble");
    }

    let curTarget: EventTarget | null = event.composedPath()[0];
    let target: EventTarget | null = curTarget;

    Object.defineProperty(event, "target", { get: () => target });
    Object.defineProperty(event, "currentTarget", { get: () => curTarget });

    // bubble bottom-up - we are traversing the ll manually due to the composedPath
    // not always containing the complete list of nodes (specifically, closed shadow dom nodes)
    while (notNullOrUndefined(curTarget) && !event.cancelBubble) {
      if (this.eventTargets.get(event.type)?.has(curTarget!) ?? false) {
        this.targetHandlers.get(curTarget!)?.forEach((h) => {
          h.event === event.type && h.handler(event);
        });
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/host
      if (
        notNullOrUndefined((curTarget as any)?.host) &&
        (curTarget as any).host instanceof Node
      ) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/composed
        curTarget = event.composed ? (curTarget as any).host : null;
        // since we have crossed a shadow dom boundary, we need to reset target to the shadow dom host node
        target = curTarget;
      } else {
        curTarget = (curTarget as any).parentNode;
      }
    }

    return;
  };
}
