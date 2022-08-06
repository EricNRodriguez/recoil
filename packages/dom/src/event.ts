import { Consumer, notNullOrUndefined } from "../../util";
import { WNode } from "./node";

type EventHandlerRef = {event: keyof HTMLElementEventMap, handler: Consumer<any>};

export class GlobalEventCoordinator {
  private readonly eventTargets: Map<string, WeakSet<Node>> = new Map();
  private readonly targetHandlers: WeakMap<Node, EventHandlerRef[]> =
    new WeakMap();

  // the idea here is to decide if we should delegate or if we should attach directly
  // the answer comes from the event type itself, which can either be "composed" or not - this directly
  // effects if it can propagate past shadow dom boundaries. We shouldnt bother optimizing handling for this case,
  // etc etc. Read into it. As for now I treat every event as composable, which is wrong.
  public attachEventHandler<K extends keyof HTMLElementEventMap>(
    event: K,
    node: WNode<Node>,
    handler: Consumer<HTMLElementEventMap[K]>
  ): void {
    if (!this.eventTargets.has(event)) {
      // TODO(ericr): provide a way to detach the event handler. Not sure if this should be done here or in the dom wrapper
      // itself
      this.eventTargets.set(event, new WeakSet());
      document.addEventListener(event, this.executeHandlersBottomUp<K>);
    }

    this.eventTargets.get(event)!.add(node.unwrap());
    if (!this.targetHandlers.has(node.unwrap())) {
      this.targetHandlers.set(node.unwrap(), []);
    }
    this.targetHandlers.get(node.unwrap())!.push({
      event: event,
      handler: handler,
    });

    return;
  }

  public detachEventHandlers<K extends keyof HTMLElementEventMap>(
    event: K,
    node: WNode<Node>,
  ): void {
    this.eventTargets.get(event)?.delete(node.unwrap());
    this.targetHandlers.set(
      node.unwrap(),
      this.targetHandlers.get(node.unwrap())?.filter(r => r.event === event) ?? [],
    );
  }

  // TODO(ericr): test this properly.... read the mdn docs properly.... I hacked this together
  // without much thought. Subtle things like shadow dom boundaries, multiple events on the same node,
  // events on the document etc etc need to be handled.
  private executeHandlersBottomUp = <K extends keyof HTMLElementEventMap>(
    event: HTMLElementEventMap[K]
  ): void => {
    const path: EventTarget[] = event.composedPath();
    let curNode: number = 0;

    // simulate bubbling targets
    Object.defineProperty(event, "target", { value: path[0] });
    Object.defineProperty(event, "currentTarget", { get: () => path[curNode] });

    // bubble bottom-up
    for (; curNode < path.length && !event.cancelBubble; ++curNode) {
      const node = path[curNode] as Node;
      if (this.eventTargets.get(event.type)?.has(node)) {
        this.targetHandlers.get(node)?.forEach((h) => {
          h.event === event.type && h.handler(event);
        });
      }
    }

    return;
  };
}
