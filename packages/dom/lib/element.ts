import { BaseWNode, WNode } from "./node";
import { Method } from "shared";
import { GlobalEventCoordinator } from "./event";
export type ElementStyle = { [key: string]: string };

export abstract class BaseWElement<
  A extends HTMLElement,
  B extends BaseWElement<A, B>
> extends BaseWNode<A, B> {
  private readonly eventCoordinator: GlobalEventCoordinator;

  constructor(element: A, eventCoordinator: GlobalEventCoordinator) {
    super(element);
    this.eventCoordinator = eventCoordinator;
  }

  public setAttribute(attribute: string, value: string): B {
    this.unwrap().setAttribute(attribute, value as string);
    return this as unknown as B;
  }

  public setEventHandler<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: Method<HTMLElement, HTMLElementEventMap[K], void>,
    delegate: boolean = false
  ): B {
    if (delegate) {
      this.eventCoordinator.attachEventHandler(type, this.unwrap(), listener);
    } else {
      this.unwrap().addEventListener(type, listener);
    }
    return this as unknown as B;
  }
}

export class WElement<T extends HTMLElement>
  extends BaseWElement<T, WElement<T>>
  implements WNode<T>
{
  constructor(elem: T, eventCoordinator: GlobalEventCoordinator) {
    super(elem, eventCoordinator);
  }
}
