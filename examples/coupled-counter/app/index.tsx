/** @jsx jsx */

import {CoupledCounter, Logger} from "./counter_component";
import {WElement, WNode} from "recoiljs-dom";
import {loggerInjectionKey} from "./constant";
import {createComponent, provide} from "recoiljs-component";
import { runApp, jsx } from "recoiljs-dom-jsx";

const App = createComponent((): WElement<HTMLElement> => {
  provide(loggerInjectionKey, new Logger());
  return CoupledCounter();
});

runApp(
  document.body,
  <App />
)

