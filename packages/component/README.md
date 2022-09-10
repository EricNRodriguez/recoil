# Overview

The component package provides a higher level api to that of the dom package, increasing declarativeness and improving DX.  

The api provides two sets of methods:
1. High level declarative hooks that abstract away the low level methods provided by the `dom` package
    1. `onMount`
    2. `onUnmount`
    3. `onInitialMount`
    4. `runMountedEffect`
    5. `defer`: An exposed implementation detail enabling custom application-specific hooks to be built.
2. A type-safe (tracked) dependency injection API, analogous to that provided by the vue composition API.
    1. `inject`
    2. `provide`

In order to make a component, wrap any raw dom builder with `createComponet`.  

> WARNING: In order for DI to work with lazily constructed/reconstructed DOM trees, the callback needs to close over the DI scope at the current time, and hence, is required to be wrapped with a `captureContextState` call.

For application specific extensions, the `createComponent` and `makeLazy` methods provide support for runtime decoration through the `decorateCreateComponent` and `decorateMakeLazy`.

# Example

```tsx

export const TodoList = createComponent((): WElement<HTMLElement> => {
  const model = inject(todoModelInjectionKey)!;

  const withUuidKey = (item: TodoItem) => [item.uuid.toString(), item];
  const renderTodoItem = makeLazy((item: TodoItem) => <TodoListItem item={item} />);

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
