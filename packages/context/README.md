# Overview

The context package provides utility hooks that make writing and maintaining complex applications less challenging.

The api provides two core DX improvements:
1. High level declarative hooks that abstract away the low level methods provided by the `dom` package
    1. `onMount`
    2. `onUnmount`
    3. `onInitialMount`
    4. `runMountedEffect`
    5. `defer`: An exposed implementation detail enabling custom application-specific hooks to be built.
2. A type-safe (tracked) dependency injection API, analogous to that provided by the vue composition API.
    1. `inject`
    2. `provide`

In order to make a component `contextual`, wrap it with `withContext`.

> WARNING: In order for DI to work with lazily constructed/reconstructed DOM trees, the callback needs to close over the DI scope at the current time, and hence, is required to be wrapped with a `captureContextState` call.

# Example

```tsx

export const TodoList = withContext((): WElement<HTMLElement> => {
  const model = inject(todoModelInjectionKey)!;

  const withUuidKey = (item: TodoItem) => [item.uuid.toString(), item];
  const renderTodoItem = captureContextState((item: TodoItem) => <TodoListItem item={item} />);

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

```
