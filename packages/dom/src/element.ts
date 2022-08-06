import { BiConsumer, Consumer, Runnable, Supplier } from "../../util";
import { BaseWNode, BindedValue, WNode } from "./node";
import { BiFunction, Method } from "../../util/src/function.interface";
import { IAtom, isAtom, runEffect } from "../../atom";
import { t } from "../../dom-dsl";
import {GlobalEventCoordinator} from "./event";
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

  public bindAttribute(attribute: string, value: BindedValue<string>): B {
    if (isAtom(value)) {
      this.registerEffect(() =>
        this.unwrap().setAttribute(attribute, (value as IAtom<string>).get())
      );
    } else {
      this.registerEffect(() =>
        this.unwrap().setAttribute(attribute, (value as Supplier<string>)())
      );
    }

    return this as unknown as B;
  }

  // we don't want to register events, rather, we should be delegating.
  public setEventHandler<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: Method<HTMLElement, HTMLElementEventMap[K], void>
  ): B {
    this.eventCoordinator.attachEventHandler(type, this, listener);
    // this.unwrap().addEventListener(type, listener);
    return this as unknown as B;
  }

  public removeEventHandler<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: Method<HTMLElement, HTMLElementEventMap[K], void>
  ): B {
    throw new Error("unimplemented - this should not be on main");
    // this.unwrap().removeEventListener(type, listener);
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
  constructor(elem: T, eventCoordinator: GlobalEventCoordinator) {
    super(elem, eventCoordinator);
  }
}
