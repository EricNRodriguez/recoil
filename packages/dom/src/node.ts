import {
  firstNonEqualIndex,
  notNullOrUndefined,
  nullOrUndefined,
  removeNullAndUndefinedItems,
  Runnable,
} from "../../util";

export abstract class BaseWNode<A extends Node, B extends BaseWNode<A, B>> {
  private parent: WNode<Node> | null = null;
  private readonly node: A;
  private readonly children: WNode<Node>[] = [];
  private readonly onMountHooks: Set<Runnable> = new Set<Runnable>();
  private readonly onUnmountHooks: Set<Runnable> = new Set<Runnable>();
  private currentlyMounted: boolean = false;

  protected constructor(node: A) {
    this.node = node;
  }

  private isFragment(): boolean {
    return this.node instanceof DocumentFragment;
  }

  private getUnpackedChildren(): Node[] {
    const unpackedNodes: Node[] = [];

    for (let wNode of this.getChildren()) {
      if (wNode.isFragment()) {
        unpackedNodes.push(...wNode.getUnpackedChildren());
      } else {
        unpackedNodes.push(wNode.unwrap());
      }
    }

    return unpackedNodes;
  }

  public getChildren(): WNode<Node>[] {
    return this.children;
  }

  private rebindChildren(): void {
    this.setChildren(...this.children);
  }

  public setChildren(
    ...children: (WNode<Node> | Node | null | undefined)[]
  ): B {
    const currentChildren: WNode<Node>[] = this.children;

    const newChildren: WNode<Node>[] = children
      .map(wrapInVNode)
      .filter(notNullOrUndefined) as WNode<Node>[];

    const newChildrenSet: Set<WNode<Node>> = new Set(newChildren);

    this.children.length = 0;
    this.children.push(...newChildren);

    // sync mount status of new children to this dom node
    newChildren.forEach((nc) => this.syncMountStatusOfChild(nc));

    // unmount any current children that are not in the newChildren list
    if (this.isMounted()) {
      currentChildren
        .filter((cc) => !newChildrenSet.has(cc))
        .forEach((cc) => {
          cc.unmount();
          cc.setParent(null);
        });
    }

    if (this.isFragment()) {
      this.getParent()?.rebindChildren();
      return this as unknown as B;
    }

    let unwrappedCurrentChildren: Node[] = Array.from(this.unwrap().childNodes);
    let unwrapedNewChildren: Node[] = this.getUnpackedChildren();

    // we are unpacking before we diff to ensure fragment children are properly expanded
    let firstNewNodeIndex: number = firstNonEqualIndex(
      unwrappedCurrentChildren,
      unwrapedNewChildren
    );

    removeChildren(
      this.unwrap(),
      unwrappedCurrentChildren.slice(firstNewNodeIndex)
    );

    appendChildren(this.unwrap(), unwrapedNewChildren.slice(firstNewNodeIndex));

    return this as unknown as B;
  }

  public syncMountStatusOfChild(child: WNode<Node>): void {
    child.setParent(this);
    if (this.isMounted() !== child.isMounted()) {
      this.isMounted() ? child.mount() : child.unmount();
    }
  }

  public isMounted(): boolean {
    return this.currentlyMounted;
  }

  private setParent(parent: WNode<Node> | null): void {
    this.parent = parent;
  }

  public getParent(): WNode<Node> | null {
    return this.parent;
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

  public unwrap(): A {
    return this.node;
  }
}

export class WNode<T extends Node> extends BaseWNode<T, WNode<T>> {
  constructor(node: T) {
    super(node);
  }
}

export const isWNode = (content: any): boolean => {
  return content instanceof Object && "unwrap" in content;
};

export const unwrapVNode = (content: Node | WNode<Node>): Node => {
  if (content === null || content === undefined) {
    return content;
  }

  if (isWNode(content)) {
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

  if (isWNode(node)) {
    return node as WNode<Node>;
  } else {
    return new WNode(node as Node);
  }
};

const removeChildren = (node: Node, children: Node[]): void => {
  removeNullAndUndefinedItems(children).forEach((child: Node): void => {
    node.removeChild(child);
  });
};

const appendChildren = (node: Node, children: Node[]): void => {
  if (children.length === 1) {
    node.appendChild(children[0]);
  } else {
    if (node instanceof HTMLElement) {
      (node as HTMLElement).append(...children);
    } else {
      const frag: DocumentFragment = document.createDocumentFragment();
      children.forEach((c) => frag.appendChild(c));
      node.appendChild(frag);
    }
  }
};
