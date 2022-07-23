import { Attribute, VElement, ElementStyle } from "./virtual_element.interface";
import {
  unwrapVNode,
  wrapInVNode,
  appendChildren,
  removeChildren,
  replaceChildren,
} from "./vdom_util";
import { VNode } from "./virtual_node.interface";
import { VNodeBase } from "./virtual_node_base";
import { HtmlVNode } from "./virtual_node";
import {BiConsumer, Consumer, notNullOrUndefined} from "../../util";
import {IAtom, isAtom} from "../../atom";

/**
 * A lightweight wrapper around a Html Dom element, encapsulating lifecycle management, mounting/unmounting of subcomponents, etc
 */
export class HtmlVElement
  extends VNodeBase<HTMLElement, HtmlVElement>
  implements VElement<HTMLElement, HtmlVElement>, HtmlVNode
{
  private readonly children: VNode<any, any>[] = [];

  constructor(element: string | HTMLElement) {
    super(
      typeof element === "string"
        ? document.createElement(element)
        : (element as HTMLElement)
    );
  }

  public mount(): HtmlVElement {
    super.mount();

    this.children.forEach((child: VNode<any, any>): void => {
      child.mount();
    });

    return this;
  }

  public unmount(): HtmlVElement {
    super.unmount();

    this.children.forEach((child: VNode<any, any>): void => {
      child.unmount();
    });

    return this;
  }

  public setChildren(
    ...children: (VNode<any, any> | Node | null | undefined)[]
  ): HtmlVElement {
    this.unmountCurrentChildren();

    const newChildren: VNode<any, any>[] = children
      .map(wrapInVNode)
      .filter(notNullOrUndefined) as VNode<any, any>[];

    this.children.length = 0;

    replaceChildren(this.getRaw(), ...[]);

    this.pushNewChildren(newChildren);

    return this;
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

  public deleteChildren(offset: number): HtmlVElement {
    const childrenToRemove: Node[] = this.children
      .slice(offset)
      .map((child: VNode<any, any>): VNode<any, any> => child.unmount())
      .map((child: VNode<any, any>): Node => child.getRaw());

    removeChildren(this.getRaw(), childrenToRemove);

    this.children.length = offset;

    return this;
  }

  public appendChildren(
    children: (VNode<any, any> | Node | null | undefined)[]
  ): HtmlVElement {
    const newChildren: VNode<any, any>[] = children
      .map(wrapInVNode)
      .filter(notNullOrUndefined) as VNode<any, any>[];

    this.pushNewChildren(newChildren);

    return this;
  }

  private pushNewChildren(newChildren: VNode<any, any>[]): void {
    this.children.push(...newChildren);
    newChildren.forEach(this.insertChildIntoDom.bind(this));
    this.syncMountStatusOfChildren();
  }

  private insertChildIntoDom(child: VNode<any, any>): void {
    appendChildren(this.getRaw(), [child].map(unwrapVNode));
  }

  public setAttribute(attribute: string, value: Attribute): HtmlVElement {
    if (isAtom(value)) {
      return this.setAtomicAttribute(attribute, value as IAtom<string>);
    } else if (typeof value === "string") {
      return this.setStaticAttribute(attribute, value);
    }

    // TODO(ericr): replace with specific fall through error
    throw new Error("unsupported attribute type");
  }

  private setStaticAttribute(attribute: string, value: string): HtmlVElement {
    this.getRaw().setAttribute(attribute, value);
    return this;
  }

  private setAtomicAttribute(
    attribute: string,
    value: IAtom<string>
  ): HtmlVElement {
    const ref = value.react((): void => {
      this.setAttribute(attribute, value.get());
    });

    this.registerOnMountHook(ref.activate.bind(ref));
    this.registerOnUnmountHook(ref.deactivate.bind(ref));
    return this;
  }

  public setClickHandler(handler: Consumer<MouseEvent>): HtmlVElement {
    this.getRaw().addEventListener("click", handler);
    return this;
  }

  public addEventHandler(
    eventType: string,
    handler: BiConsumer<Event, HTMLElement>
  ): HtmlVElement {
    this.getRaw().addEventListener(eventType, (event: Event): void =>
      handler(event, this.getRaw())
    );
    return this;
  }

  public setStyle(style: ElementStyle): HtmlVElement {
    Object.entries(style).forEach(
      ([property, value]: [string, string]): void => {
        this.getRaw().style.setProperty(property, value);
      }
    );
    return this;
  }
}
