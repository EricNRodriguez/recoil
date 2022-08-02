import { BiConsumer, Consumer } from "../../util";
import { BaseWNode, WNode } from "./node";
export type ElementStyle = { [key: string]: string };

export abstract class BaseWElement<
    A extends HTMLElement,
    B extends BaseWElement<A, B>
  >
  extends BaseWNode<A, B>
{
  constructor(element: A) {
    super(element);
  }

  public setAttribute(attribute: string, value: string): B {
    this.unwrap().setAttribute(attribute, value);
    return this as unknown as B;
  }

  public setClickHandler(handler: Consumer<MouseEvent>): B {
    this.unwrap().addEventListener("click", handler);
    return this as unknown as B;
  }

  public addEventHandler(eventType: string, handler: BiConsumer<Event, A>): B {
    this.unwrap().addEventListener(eventType, (event: Event): void =>
      handler(event, this.unwrap())
    );
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

export class WElement<T extends HTMLElement> extends BaseWElement<
  T,
  WElement<T>
> implements WNode<T> {
  constructor(elem: T) {
    super(elem);
  }
}
