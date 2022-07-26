import {
  notNullOrUndefined,
  nullOrUndefined,
  removeNullAndUndefinedItems,
  Runnable,
} from "../../util";

export abstract class BaseWNode<A extends Node, B extends BaseWNode<A, B>> {
  private readonly id: Object = new Object();
  private readonly node: A;
  private readonly children: WNode<Node>[] = [];
  private readonly onMountHooks: Set<Runnable> = new Set<Runnable>();
  private readonly onUnmountHooks: Set<Runnable> = new Set<Runnable>();
  private currentlyMounted: boolean = false;

  constructor(node: A) {
    this.node = node;
  }

  public setChildren(
    ...children: (WNode<Node> | Node | null | undefined)[]
  ): B {
    this.unmountCurrentChildren();

    const newChildren: WNode<Node>[] = children
      .map(wrapInVNode)
      .filter(notNullOrUndefined) as WNode<Node>[];

    this.children.length = 0;

    replaceChildren(this.unwrap());
    this.pushNewChildren(newChildren);

    return this as unknown as B;
  }

  private syncMountStatusOfChildren(): void {
    this.children.forEach((child: WNode<Node>): void => {
      this.syncMountStatusOfChild(child);
    });
  }

  public syncMountStatusOfChild(child: WNode<Node>): void {
    if (this.isMounted() !== child.isMounted()) {
      this.isMounted() ? child.mount() : child.unmount();
    }
  }

  private unmountCurrentChildren(): void {
    this.children.forEach(
      (oldChild: WNode<Node>): WNode<Node> => oldChild.unmount()
    );
  }

  public deleteChildren(offset: number): B {
    const childrenToRemove: Node[] = this.children
      .slice(offset)
      .map((child: WNode<Node>): WNode<Node> => child.unmount())
      .map(unwrapVNode);

    removeChildren(this.unwrap(), childrenToRemove);

    this.children.length = offset;

    return this as unknown as B;
  }

  public appendChildren(
    children: (WNode<Node> | Node | null | undefined)[]
  ): B {
    const newChildren: WNode<Node>[] = children
      .map(wrapInVNode)
      .filter(notNullOrUndefined) as WNode<Node>[];

    this.pushNewChildren(newChildren);

    return this as unknown as B;
  }

  private pushNewChildren(newChildren: WNode<Node>[]): void {
    this.children.push(...newChildren);
    newChildren.forEach(this.insertChildIntoDom.bind(this));
    newChildren.forEach(this.syncMountStatusOfChild.bind(this));
  }

  private insertChildIntoDom(child: WNode<Node>): void {
    appendChildren(this.unwrap(), [child].map(unwrapVNode));
  }

  public isMounted(): boolean {
    return this.currentlyMounted;
  }

  public mount(): B {
    this.currentlyMounted = true;
    this.children.forEach((child: WNode<Node>): void => {
      child.mount();
    });
    this.runMountHooks();
    return this as unknown as B;
  }

  public unmount(): B {
    this.currentlyMounted = false;
    this.children.forEach((child: WNode<Node>): void => {
      child.unmount();
    });
    this.runUnmountHooks();
    return this as unknown as B;
  }

  private runUnmountHooks(): void {
    this.onUnmountHooks.forEach((hook) => hook());
  }

  private runMountHooks(): void {
    this.onMountHooks.forEach((hook) => hook());
  }

  public registerOnMountHook(hook: Runnable): B {
    this.onMountHooks.add(hook);

    return this as unknown as B;
  }

  public registerOnUnmountHook(hook: Runnable): B {
    this.onUnmountHooks.add(hook);

    return this as unknown as B;
  }

  public getId(): Object {
    return this.id;
  }

  public unwrap(): A {
    return this.node;
  }
}

export class WNode<T extends Node> extends BaseWNode<T, WNode<T>> {
  constructor(node: T) {
    super(node);
  }
}

export const isVNode = (content: any): boolean => {
  return content instanceof Object && "unwrap" in content;
};

export const unwrapVNode = (content: Node | WNode<Node>): Node => {
  if (content === null || content === undefined) {
    return content;
  }

  if (isVNode(content)) {
    return (content as WNode<Node>).unwrap();
  }

  return content as Node;
};

export const wrapInVNode = (
  node: WNode<Node> | Node | string | null | undefined
): WNode<Node> | null | undefined => {
  if (nullOrUndefined(node)) {
    return node as null | undefined;
  }

  if (isVNode(node)) {
    return node as WNode<Node>;
  } else {
    return new WNode(node as Node);
  }
};

const replaceChildren = (
  node: Node,
  ...children: (Node | null | undefined)[]
): void => {
  clearChildren(node);
  appendChildren(
    node,
    children.filter((c) => c !== null && c !== undefined) as Node[]
  );
};

const clearChildren = (node: Node): void => {
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild!);
  }
};

const removeChildren = (node: Node, children: Node[]): void => {
  removeNullAndUndefinedItems(children).forEach((child: Node): void => {
    node.removeChild(child);
  });
};

const appendChildren = (node: Node, children: Node[]): void => {
  removeNullAndUndefinedItems(children).forEach((child: Node): void => {
    node.appendChild(child);
  });
};
