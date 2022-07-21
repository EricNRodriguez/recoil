import {runApp} from "recoil/packages/dom-dsl"
import {coupledCounter} from "./counter_component";

runApp(
  document.body,
  coupledCounter(),
)