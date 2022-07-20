import {br, button, div, foreach, h2, ifElse, t, textInput} from "../../../packages/dom-dsl";
import {HtmlVElement, HtmlVNode} from "../../../packages/vdom";
import {createState, state} from "../../../packages/atom";
import {createComponent} from "../../../packages/dom-component";
import {TodoItem, TodoModel} from "./todo_model";


export const todoList = createComponent((model: TodoModel): HtmlVElement => {

  return div(
    h2("todo list:"),
    foreach(
      () => model.getItems().map(item => [item.uuid.toString(), item]),
      (item: TodoItem): HtmlVNode => todoListItem(item, model),
    ),
    ifElse(
      () => model.getItems().length > 0,
      br(),
    ),
    todoItemInput(model),
  )
});

const todoItemInput = (model: TodoModel): HtmlVNode => {
  const currentEnteredContent = createState<string>("");

  const input = textInput(currentEnteredContent);

  const onSubmit = (): void => {
    model.appendNewItem(currentEnteredContent.get());

    (input.getRaw() as HTMLInputElement).value = "";
    currentEnteredContent.set("");
  }

  input.addEventHandler('keydown', (event: Event): void => {
    if ((event as KeyboardEvent).key === "Enter") {
      onSubmit();
    }
  });

  return div(
    input,
    button({
      content: "+",
      onClick: onSubmit,
    })
  );
};

const todoListItem = (item: TodoItem, model: TodoModel): HtmlVNode => {
  const buttonDivStyle = {
    "padding-right": "10px",
    "display": "inline-block",
  };

  const outerDivStyle = {
    "padding": "5px 5px 5px 0px",
  };

  return div(
    div(
      button({
        content: "-",
        onClick: (): void => model.removeItem(item),
      })
    ).setStyle(buttonDivStyle),
    t(item.content),
  ).setStyle(outerDivStyle);
}

