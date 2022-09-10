import { runApp } from "recoiljs-dom-dsl";
import { time } from "./timezone_component";

runApp(document.body, time());
