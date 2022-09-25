/** @jsx jsx */

import {TodoItem, TodoModel} from "./todo_model";
import {WElement} from "recoiljs-dom";
import {div, h2, br, button, input} from "recoiljs-dom-dsl";
import {createState, derivedState, deriveState, runBatched} from "recoiljs-atom";
import { inject, createComponent, makeLazy, decorateMakeLazy, decorateCreateComponent } from "recoiljs-component";
import {todoModelInjectionKey} from "./index";
import {jsx, For, If, $, Fragment} from "recoiljs-dom-jsx";
import {css} from "./util";


type TodoListControlsProps = {
    model: TodoModel;
};
const TodoListControls = createComponent((props: TodoListControlsProps) => {
  const emptyList = deriveState(() => !props.model.isNonEmpty(), false);

  return (
      <div>
        <button onclick={() => props.model.duplicate()} disabled={emptyList}>
          double
        </button>
        <button onclick={() => props.model.clearItems()} disabled={emptyList}>
          clear
        </button>
      </div>
  );
});

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
        <TodoListControls model={model} />
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

