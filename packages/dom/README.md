# Overview

The `dom` package provides low level utilities / classes that enable performant dom operations. Specifically, the package provides wrapper classes for dom nodes
and elements that implement performant reconciliation, event delegation (including simulated event bubbling with correct handling of shadow dom boundaries) and fragment nodes. 

# API

### Wrapping Dom Nodes/Elements
``` ts
/**
* Wraps a raw dom element in a WElement
*/
const wrapElement = <K extends keyof HTMLElementTagNameMap>(
  rawElement: HTMLElementTagNameMap[K]
): WElement<HTMLElementTagNameMap[K]>;


/**
* Wraps a raw dom node in a WNode
*/
const wrapNode = <T extends Node>(rawNode: T): WNode<T>;
```

### Factory Methods 

```ts
/**
 * Creates a fragment node. This node will be expanded when inserted as a child of any other WNode. 
 */
const createFragment = (children: WNode<Node>[]): WNode<DocumentFragment>;

/**
 * Creates a WElement. Props and children will be set on the raw dom node.
 */
const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, any>,
  children:  WNode<Node>[]
): WElement<HTMLElementTagNameMap[K]>;

/**
 * Creates a text node WNode
 */
const createTextNode = (text: string): WNode<Text>;
```

# WElement/WNode Interface

```ts

interface WNode<T extends Node> {
  /**
   * Returns the raw DOM node
   */
  unwrap(): T;

  /**
   * Registers a callback to run everytime the WNode is taken out of the dom
   */
  registerOnUnmountHook(hook: Runnable): WNode<T>;

  /**
   * Registers a callback to run everytime the WNode is inserted into the dom
   */
  registerOnMountHook(hook: Runnable): WNode<T>;

  /**
   * Binds the scope of the wrapper to the internal node such that if the wrapped node is in scope, 
   * so is this wrapper.
   */
  bindScopeToWrappedNode(): WNode<T>;

  /**
   * Returns the parent node, if it exists.
   */
  getParent(): WNode<Node> | null;

  /**
   * Sets the children nodes. This includes performant dom reconciliation. 
   */
  setChildren(children: (WNode<Node> | Node | null | undefined)[]): WNode<T>;

  /**
   * Sets the property of the wrapped dom node to the given value. 
   */
  setProperty<V>(prop: string, value: V): WNode<T>;
};


interface WElement<T extends HTMLElement> extends WNode<T> {
  /**
   * Registers an event handler to the element.
   *
   * @param type The event type
   * @param listener The event handler
   * @param delegate A boolean specifying if the handler should be attached to the document (with simulated bubbling) or the raw element.
   */
  setEventHandler<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: Method<HTMLElement, HTMLElementEventMap[K], void>,
    delegate: boolean,
  ): IWElement<T>;

  /**
   * Sets the attribute of the wrapped dom element.
   */
  setAttribute(attribute: string, value: string): IWElement<T>;
};

```

