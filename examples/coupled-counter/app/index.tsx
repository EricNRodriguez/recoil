/** @jsx jsx */

import {CoupledCounter, Logger} from "./counter_component";
import {WElement, WNode} from "recoiljs-dom";
import {loggerInjectionKey} from "./constant";
import {withContext, provide} from "../../../packages/component";
import { runApp, jsx } from "recoiljs-dom-jsx";

const App = withContext((): WElement<HTMLElement> => {
  provide(loggerInjectionKey, new Logger());
  return CoupledCounter();
});

runApp(
  document.body,
  <App />
)

