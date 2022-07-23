import { BiConsumer, Consumer } from "../../util";
import { IAtom, isAtom } from "../../atom";
import { AVNode } from "./node";
export type ElementStyle = { [key: string]: string };

export type Attribute = string | IAtom<string>;

export abstract class AVElement<
  A extends HTMLElement,
  B extends AVElement<A, B>
> extends AVNode<A, B> {
  constructor(element: A) {
    super(element);
  }

  public setAttribute(attribute: string, value: Attribute): B {
    if (isAtom(value)) {
      return this.setAtomicAttribute(attribute, value as IAtom<string>);
    } else if (typeof value === "string") {
      return this.setStaticAttribute(attribute, value);
    }

    // TODO(ericr): replace with specific fall through error
    throw new Error("unsupported attribute type");
  }

  private setStaticAttribute(attribute: string, value: string): B {
    this.getRaw().setAttribute(attribute, value);
    return this as unknown as B;
  }

  private setAtomicAttribute(attribute: string, value: IAtom<string>): B {
    const ref = value.react((): void => {
      this.setAttribute(attribute, value.get());
    });

    this.registerOnMountHook(ref.activate.bind(ref));
    this.registerOnUnmountHook(ref.deactivate.bind(ref));
    return this as unknown as B;
  }

  public setClickHandler(handler: Consumer<MouseEvent>): B {
    this.getRaw().addEventListener("click", handler);
    return this as unknown as B;
  }

  public addEventHandler(eventType: string, handler: BiConsumer<Event, A>): B {
    this.getRaw().addEventListener(eventType, (event: Event): void =>
      handler(event, this.getRaw())
    );
    return this as unknown as B;
  }

  public setStyle(style: ElementStyle): B {
    Object.entries(style).forEach(
      ([property, value]: [string, string]): void => {
        this.getRaw().style.setProperty(property, value);
      }
    );
    return this as unknown as B;
  }
}

export class VElement<T extends HTMLElement> extends AVElement<T, VElement<T>> {
  constructor(elem: T) {
    super(elem);
  }
}
