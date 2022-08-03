import { BiConsumer, Consumer } from "../../util";
import { BaseWNode, WNode } from "./node";
import { BiFunction, Method } from "../../util/src/function.interface";
export type ElementStyle = { [key: string]: string };

export abstract class BaseWElement<
  A extends HTMLElement,
  B extends BaseWElement<A, B>
> extends BaseWNode<A, B> {
  constructor(element: A) {
    super(element);
  }

  public setAttribute(attribute: string, value: string): B {
    this.unwrap().setAttribute(attribute, value);
    return this as unknown as B;
  }

  public setEventHandler<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: Method<HTMLElement, HTMLElementEventMap[K], void>
  ): B {
    this.unwrap().addEventListener(type, listener);
    return this as unknown as B;
  }

  public removeEventHandler<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: Method<HTMLElement, HTMLElementEventMap[K], void>
  ): B {
    this.unwrap().removeEventListener(type, listener);
    return this as unknown as B;
  }

  public setStyle(style: ElementStyle): B {
    Object.entries(style).forEach(
      ([property, value]: [string, string]): void => {
        this.unwrap().style.setProperty(property, value);
      }
    );
    return this as unknown as B;
  }
}

export class WElement<T extends HTMLElement>
  extends BaseWElement<T, WElement<T>>
  implements WNode<T>
{
  constructor(elem: T) {
    super(elem);
  }
}
