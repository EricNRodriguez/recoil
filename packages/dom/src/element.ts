import {BiConsumer, Consumer, Runnable} from "../../util";
import { BaseWNode, WNode } from "./node";
import { BiFunction, Method } from "../../util/src/function.interface";
import {IAtom, isAtom, runEffect} from "../../atom";
export type ElementStyle = { [key: string]: string };

export type RawOrTracked<T> = T | IAtom<T>;

export abstract class BaseWElement<
  A extends HTMLElement,
  B extends BaseWElement<A, B>
> extends BaseWNode<A, B> {
  constructor(element: A) {
    super(element);
  }

  public setAttribute(attribute: string, value: RawOrTracked<string>): B {
    if (isAtom(value)) {
      this.registerEffect(() => this.unwrap().setAttribute(attribute, (value as IAtom<string>).get()));
    } else {
      this.unwrap().setAttribute(attribute, value as string);
    }
    return this as unknown as B;
  }

  private registerEffect(effect: Runnable): void {
    const ref = runEffect(effect);
    this.registerOnMountHook(() => ref.activate());
    this.registerOnUnmountHook(() => ref.deactivate());
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
