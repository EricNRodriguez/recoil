# Overview

The `dom` package provides low level utilities that enable performant dom operations. Specifically, the package provides 
imperative utilities for managing lifecycles, performant reconciliation, event delegation (including simulated event bubbling with correct handling of shadow dom boundaries) 
and fragment nodes. 

# API

### Instantiating Nodes

```typescript 
/**
 * Utility factory for creating DOM elements. 
 */ 
createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props,
  children: Node[]
): HTMLElementTagNameMap[K];

```
```typescript 
/**
 * Utility factory for creating DOM text nodes. 
 */ 
 createTextNode = (text: string): Text;
```

```typescript
/**
 * Factory method for fragment nodes. 
 * 
 * The returned node should be treated as a stub - it is a logical
 * node that is never inserted into the dom itself. 
 * 
 * NEVER attempt to mutate the children of the returned node itself, rather
 * opt for the `setChildren` method provided by this package.
 */
createFragment = (children: Node[]): Node;

```
# Lifecycle Methods

```typescript
registerOnUnmountHook = (node: Node, hook: Runnable): void;
```

```typescript
registerOnMountHook = (node: Node, hook: Runnable): void;
```

```typescript 
registerOnCleanupHook = (node: Node, hook: Runnable): void;
```

# Delegated Event Handling 

```typescript

registerEventHandler = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: Method<HTMLElement, HTMLElementEventMap[K], void>
): void;


deregisterDelegatedEventHandler = <
  K extends keyof HTMLElementEventMap
  >(
  element: HTMLElement,
  type: K,
  listener: Method<HTMLElement, HTMLElementEventMap[K], void>
): void;
```

# Updating the DOM

It is generally safe to mutate properties/attributes through the raw nodes/elements returned from the factory
methods. It is, however, not safe to explicitly modify a nodes children manually, rather you should opt for the `setChildren`
utility. This is required for lifecycle management and the implementation of fragments/portals, and should always be used.

If authoring a higher order component that abstracts away the `setChildren` method, be aware that `cleanup` needs to be executed manually
before any nodes are disposed. This has been left as a manual operation to allow more advanced caching strategies to be used
in dsl helpers. Unlike `cleanup`, mounting/unmounting is handled internally.

```typescript

/**
 * Reconciles the parents current children with the children provided to this method.
 * 
 * New children will have their onMount hooks run, and discarded children will have their onUnmount hooks run.
 * 
 * Fragment nodes will be unwrapped/flattened as you would logically expect.
 */
setChildren = (
  parent: Node,
  children: (Node | string)[]
): void;

/**
 * Executes any registered cleanup hooks for the respective dom node. 
 */
cleanup = (node: Node): void;

```
