import { Attribute, VElement, ElementStyle } from "./virtual_element.interface";
import { VNodeBase } from "./virtual_node_base";
import { HtmlVNode } from "./virtual_node";
import {BiConsumer, Consumer} from "../../util";
import {IAtom, isAtom} from "../../atom";

/**
 * A lightweight wrapper around a Html Dom element, encapsulating lifecycle management, mounting/unmounting of subcomponents, etc
 */
export class HtmlVElement
  extends VNodeBase<HTMLElement, HtmlVElement>
  implements VElement<HTMLElement, HtmlVElement>, HtmlVNode
{

  constructor(element: string | HTMLElement) {
    super(
      typeof element === "string"
        ? document.createElement(element)
        : (element as HTMLElement)
    );
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
