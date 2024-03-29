# Overview

An experimental jsx implementation to be used in place of the `dom-dsl`. Internally it mostly wraps the `dom-dsl` package with runtime logic and a simple jsx pragma, and as a result is able to be used interchangeably at this point in time (this is likely going to be broken after a custom transpiler is written).

#### Data Binding

Text nodes can be binded to atomic values through the `$` helper function, which can be treated similarly to `t` from `dom-dsl`.

### Components

Unlike `dom-dsl`, components that return jsx must adhere to a strict type.

```ts
type Component<
  Props extends Object,
  Children extends Node[],
  ReturnNode extends Node
> = (props: Props, ...children: [...Children]) => ReturnNode;
```

The type system is still able to infer leaf components (no children), hence prop-only components are also valid.

#### Control Elements

###### For

Provides performant and memory-efficient dom rendering of a collection of indexed elements. Analogous to `forEach` from `dom-dsl`. The node is a leaf-node, and will ignore any children provided to it directly.

``` ts
type ForProps<T> = {
    items: Supplier<IndexedItem<T>[]>;
    render: Function<T, Node>;
};
```

###### If

Provides a performant and memory-efficient `if` node.

```ts
type IfProps = {
  condition: boolean | IAtom<boolean>;
  true: Supplier<Node>;
  false?: Supplier<Node>;
}
```

###### Suspense

Provides a standard implementation of a `Suspense` component - analogous to Suspense from any modern framework. Unlike the other control nodes listed here, this is not a leaf. It can take one or more async components (i.e. components that return a `Provider<WNode<Node>>`).

```ts
type SuspenseProps = {
  default?: Node;
};
```

###### Supply

A lower-level leaf node that simply runs the provided render function whenever it is dirtied. I.e. its an atomic render. This should be avoided in favor of the `For` component whenever possible, since the items are diffed by reference, which can cause unnecessary dom modifications without care - it has been exposed to allow library authors to easily build more complex primitives.

```ts
type SupplyProps = {
  getChild: Producer<Node>;
}
```

###### Switch

Similar to `If`, except that it works with state-case pairs, along with supporting defaults.

```ts
type SwitchProps<T> = {
  value: IAtom<T>;
  cases: [T, Supplier<Node>][];
  default?: Supplier<Node>;
}

```

#### Core Differences to `dom-dsl`:
1. events specified as attributes will not be delegated by default. To delegate, you need to call addEventHandler on the returned dom node.
2. custom components should begin with an upper case. This is required by the babel jsx transpiler being used.

# Standard Todo Example

``` tsx

/** @jsx jsx */

import {TodoItem} from "./todo_model";
import {div, h2, br, button, input} from "recoil/packages/dom-dsl";
import {createState, runBatched} from "recoil/packages/atom";
import { inject, withContext, captureContextState } from "recoil/packages/context";
import {todoModelInjectionKey} from "./index";
import {jsx, For, If, $} from "recoil/packages/dom-jsx";
import {css} from "./util";

export const TodoList = withContext(() => {
  const model = inject(todoModelInjectionKey)!;

  const withUuidKey = (item: TodoItem) => [item.uuid.toString(), item];
  const renderTodoItem = captureContextState((item: TodoItem) => {
      return <TodoListItem item={item} />
  });

  return (
      <div>
        <h2>
          Todo List:
        </h2>
        <p>
          {$(() => model.getItems().length)} items
        </p>
        <button onclick={() => model.duplicate()}>
          double!
        </button>
        <TodoItemInput />
        <If condition={() => model.getItems().length > 0}
            true={br}
        />
        <For items={() => model.getItems().map(withUuidKey)}
             render={renderTodoItem}
       />
      </div>
  );
});

const TodoItemInput = withContext(() => {
  const model = inject(todoModelInjectionKey)!;

  const currentEnteredContent = createState<string>("");

  const onKeyDown = (e: KeyboardEvent) =>{
    e.key === "Enter" && onSubmit();
  }
  const onInput = (e: Event) => {
    currentEnteredContent.set(e.target.value);
  }

  const onSubmit = (): void => {
    runBatched(() => {
      model.appendNewItem(currentEnteredContent.get());
      currentEnteredContent.set("");
    });
  }

  return (
      <div>
        <input onkeydown={onKeyDown} oninput={onInput} value={currentEnteredContent}/>
        <button onclick={onSubmit}>
          +
        </button>
      </div>
  );
});

type TodoListItemProps = {
  item: TodoItem;
}

const TodoListItem = withContext((props: TodoListItemProps) => {
  const model = inject(todoModelInjectionKey)!;

  const buttonDivStyle = css({
    "margin-right": "10px",
    "display": "inline-block",
  });

  const outerDivStyle = css({
    "padding": "5px 5px 5px 0px",
  });

  return (
    <div style={outerDivStyle}>
      <button onclick={() => model.removeItem(props.item)} style={buttonDivStyle}>
        -
      </button>
      {props.item.content}
    </div>
  );
});


```
