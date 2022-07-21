import {runApp} from "recoil/packages/dom-dsl";
import {time} from "./timezone_component";

runApp(
  document.body,
  time(),
)