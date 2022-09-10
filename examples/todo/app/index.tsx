/** @jsx jsx */

import {TodoList} from "./todo_component";
import {TodoModel} from "./todo_model";
import {createComponent, provide, SymbolKey} from "recoiljs-component";
import {jsx, runApp} from "recoiljs-dom-jsx";

export const todoModelInjectionKey = Symbol() as SymbolKey<TodoModel>;

const App = createComponent(() => {
  provide(todoModelInjectionKey, new TodoModel());

  return <TodoList />;
});

runApp(
  document.body,
  <App />,
);