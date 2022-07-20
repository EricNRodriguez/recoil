import {runApp} from "../../../packages/dom-dsl";
import {time} from "./timezone_component";

runApp(
  document.body,
  time(),
)