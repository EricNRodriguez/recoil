import {Consumer, notNullOrUndefined} from "../../util";
import {WNode} from "./node";

export class GlobalEventCoordinator {
  private readonly eventTargets: Map<keyof HTMLElementEventMap, Set<WNode<Node>>> = new Map();
  private readonly targetHandlers: WeakMap<Node, Consumer<any>[]> = new WeakMap();

  // the idea here is to decide if we should delegate or if we should attach directly
  // the answer comes from the event type itself, which can either be "composed" or not - this directly
  // effects if it can propagate past shadow dom boundaries. We shouldnt bother optimizing handling for this case,
  // etc etc. Read into it. As for now I treat every event as composable, which is wrong.
  public attachEventHandler<K extends keyof HTMLElementEventMap>(event: K, node: WNode<Node>, handler: Consumer<HTMLElementEventMap[K]>): void {
    if (!this.eventTargets.has(event)) {
      // TODO(ericr): provide a way to detach the event handler. Not sure if this should be done here or in the dom wrapper
      // itself
      this.eventTargets.set(event, new Set());
      document.addEventListener(event, this.handleEvent<K>);
    }

    this.eventTargets.get(event)!.add(node);
    if (!this.targetHandlers.has(node.unwrap())) {
      this.targetHandlers.set(node.unwrap(), []);
    }
    this.targetHandlers.get(node.unwrap())!.push(handler);

    return;
  }

  // TODO(ericr): test this properly.... read the mdn docs properly.... I hacked this together
  // without much thought. Subtle things like shadow dom boundaries, multiple events on the same node,
  // events on the document etc etc need to be handled.
  private handleEvent = <K extends keyof HTMLElementEventMap>(event: HTMLElementEventMap[K]): void => {
    const path: EventTarget[] = event.composedPath();
    let curNode: number = 0;

    // simulate bubbling targets
    Object.defineProperty(event, "target", {value: path[0]});
    Object.defineProperty(event, "currentTarget", {get: () => path[curNode]});

    // bubble bottom-up
    for (; curNode < path.length && !event.cancelBubble; ++curNode) {
      const node = path[curNode] as Node;
      this.targetHandlers.get(node)?.forEach((h) => h(event));
    }

    return;
  }
}