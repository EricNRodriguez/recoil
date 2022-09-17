# Overview

Recoil is a prototype lightweight UI library that requires no compilation and has a heavy focus on fine grained reactivity. 

The provided packages are all opt-in, allowing as little or as much of the library to be used (higher level packages do depend on lower level packages, and may need them to be installed manually to reduce bundle sizes and enable singleton imports to work correctly).

The features that you would expect of any modern web UI library are provided, including:
- performant dom reconciliation
- code splitting (via suspense components)
- reactive primitives for state management
- a high level declerative dom dsl
- jsx support (a lighweight pragma that wraps the dsl)
- event delegation (with support for shadow doms)
- declarative components, providing lifecycle methods, a typesafe DI, custom hooks and more.

# Packages
- `dom`: low level dom wrappers/utils/reconciliation
- `dom-dsl`: a vanilla js dom dsl
- `dom-jsx`: jsx bindings 
- `atom`: performant reactive primitives 
- `component`: DI, declarative lifecycle methods, custom scoping hooks etc

# Warning 

This library is not intended for production use, or any serious use for that matter. Whilst it should hold up in those settings, no guarantee for timely support is be given in the instance of bugs/issues. Development has been done with modern js features that are not supported on older browsers.

# Example

A set of examples are provided in the `examples` directory. An incomplete example has been provided below to illustrate the api.

```typescript jsx
/** @jsx jsx */

import {TodoItem} from "./todo_model";
import {WElement} from "recoiljs-dom";
import {div, h2, br, button, input} from "recoiljs-dom-dsl";
import {createState, runBatched} from "recoiljs-atom";
import { inject, createComponent, makeLazy, decorateMakeLazy, decorateCreateComponent } from "recoiljs-component";
import {todoModelInjectionKey} from "./index";
import {jsx, For, If, $} from "recoiljs-dom-jsx";
import {css} from "./util";

export const TodoList = createComponent((): WElement<HTMLElement> => {
  const model = inject(todoModelInjectionKey)!;

  const withUuidKey = (item: TodoItem) => [item.uuid.toString(), item];
  const renderTodoItem = makeLazy((item: TodoItem) => {
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

const TodoItemInput = createComponent((): WElement<HTMLElement> => {
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

const TodoListItem = createComponent((props: TodoListItemProps): WElement<HTMLElement> => {
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
