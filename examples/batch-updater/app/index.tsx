/** @jsx jsx */

import {BatchedCounter} from "./batched_counter";
import {jsx, runApp} from "recoiljs-dom-jsx";

runApp(
  document.body,
  <BatchedCounter />
);
