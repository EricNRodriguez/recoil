import { VNode } from "./virtual_node.interface";
import {notNullOrUndefined, Runnable} from "../../util";
import {appendChildren, removeChildren, replaceChildren, unwrapVNode, wrapInVNode} from "./vdom_util";

export abstract class VNodeBase<A extends Node, B extends VNodeBase<A, B>>
  implements VNode<A, B>
{
  private readonly node: A;
  private readonly children: VNode<any, any>[] = [];
  private readonly onMountHooks: Set<Runnable> = new Set<Runnable>();
  private readonly onUnmountHooks: Set<Runnable> = new Set<Runnable>();
  private currentlyMounted: boolean = false;

  constructor(node: A) {
    this.node = node;
  }

  public setChildren(
    ...children: (VNode<any, any> | Node | null | undefined)[]
  ): B {
    this.unmountCurrentChildren();

    const newChildren: VNode<any, any>[] = children
      .map(wrapInVNode)
      .filter(notNullOrUndefined) as VNode<any, any>[];

    this.children.length = 0;

    replaceChildren(
      this.getRaw()
    )

    replaceChildren(this.getRaw(), ...[]);

    this.pushNewChildren(newChildren);

    return this as unknown as B;
  }

  private syncMountStatusOfChildren(): void {
    this.children.forEach((child: VNode<any, any>): void => {
      if (this.isMounted() !== child.isMounted()) {
        this.isMounted() ? child.mount() : child.unmount();
      }
    });
  }

  private unmountCurrentChildren(): void {
    this.children.forEach(
      (oldChild: VNode<any, any>): VNode<any, any> => oldChild.unmount()
    );
  }

  public deleteChildren(offset: number): B {
    const childrenToRemove: Node[] = this.children
      .slice(offset)
      .map((child: VNode<any, any>): VNode<any, any> => child.unmount())
      .map((child: VNode<any, any>): Node => child.getRaw());

    removeChildren(this.getRaw(), childrenToRemove);

    this.children.length = offset;

    return this as unknown as B;
  }

  public appendChildren(
    children: (VNode<any, any> | Node | null | undefined)[]
  ): B {
    const newChildren: VNode<any, any>[] = children
      .map(wrapInVNode)
      .filter(notNullOrUndefined) as VNode<any, any>[];

    this.pushNewChildren(newChildren);

    return this as unknown as B;
  }

  private pushNewChildren(newChildren: VNode<any, any>[]): void {
    this.children.push(...newChildren);
    newChildren.forEach(this.insertChildIntoDom.bind(this));
    this.syncMountStatusOfChildren();
  }

  private insertChildIntoDom(child: VNode<any, any>): void {
    appendChildren(this.getRaw(), [child].map(unwrapVNode));
  }

  public isMounted(): boolean {
    return this.currentlyMounted;
  }

  public mount(): B {
    this.currentlyMounted = true;
    this.children.forEach((child: VNode<any, any>): void => {
      child.mount();
    });
    this.runMountHooks();
    return this as unknown as B;
  }

  public unmount(): B {
    this.currentlyMounted = false;
    this.children.forEach((child: VNode<any, any>): void => {
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

  public getRaw(): A {
    return this.node;
  }
}
