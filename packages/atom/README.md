# Overview

`atom` is a performant reactive DAG, derived at runtime. Unlike traditional reactive libraries (cough rxjs), this should be enjoyable to use. 

The reactive system can be summarised by 3 core primitives:
1. Leaf nodes
   - a reactive variable
   - contains a getter and a setter. 
2. Non leaf nodes
    - a reactive variable that is `derived` from other reactive variables. Conceptually it is a computation, with all state coming from other reactive nodes. 
    - forms a node in the DAG (due to caching)
    - dependencies are automatically detected at runtime (optimal)
3. Side effects
    - a function/job etc that should be run every time its dependants (nodes that it uses) change.


# API

### Types

```ts

interface ILeafAtom<T> extends IAtom<T> {
  /**
   * An atomic set. This will propagate through the DAG - i.e. all dependants will be auto-dirtied.
   */
  set(value: T): void;
  
  /**
   * An atomic update. This is the same as a set that uses a get. 
   */
  update(fn: (val: T) => T): void;
}


interface IAtom<T> {

  /**
   * An atomic read
   */
  get(): T;

  /**
   * A non-atomic read.
   */
  getUntracked(): T;

  /**
   * Manually dirty the atom and all its dependents.
   */
  invalidate(): void;

  /**
   * A lightweight transform of the state into another similar state.
   *
   * This can be treated as a non-caching derivation that uses a single atomic variable.
   *
   * Intended use cases are for type changes, formatting etc, where a new DAG node is pure overhead, but you want an atom
   * because an interface etc expects one.
   */
  transform<R>(transform: Function<T, R>): IAtom<R>;
}

```

### Factory Methods


###### Leaf Nodes

```ts
createState<T>(value: T): ILeafAtom<T>

````

```ts

fetchState<T | undefined>(getValue: () => Promise<T>): IAtom<T | undefined>

````

###### Non Leaf Nodes

``` ts
deriveState<T>(deriveValue: () => T, cached: boolean = true): IAtom<T>
```

###### Side Effects

```ts
runEffect(sideEffect: () => void): SideEffectRef
```

Since side effects are leafs in the DAG, and have no dependants, they will be GCd during the next gc run (the atom package internally holds weak references to prevent mem leaks). Hence, this ref is used to keep the side effect in scope (ideally managed by a higher level abstraction). The ref also provides the ability to turn the effect on and off, which becomes useful when the client knows the results of the effect (i.e. dom updates) wont be seen and should be deferred to the next time it is activated.
```ts
interface ISideEffectRef {
  activate(): void;
  deactivate(): void;
}
```

### Decorators

In attempt to reduce invasiveness into the model, the following decorators are provided. These should also make it easy to pull model state out of the view without the need for a bloated global state management library.

Decorate class instance variables with the state decorator. This will proxy the variable such that gets are automatically atomic. 
```ts
@state()
```

Decorate methods with the derivedState decorator. This will internally wrap the method with a `deriveState` call.
```ts
@derivedState()
```
