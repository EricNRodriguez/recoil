import {runApp} from "recoil/packages/dom-dsl";
import {todoList} from "./todo_component";
import {TodoModel} from "./todo_model";

runApp(
  document.body,
  todoList(new TodoModel()),
)