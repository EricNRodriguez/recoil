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
          double
        </button>
        <button onclick={() => model.clearItems()}>
          clear
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

