import {SymbolKey} from "recoiljs-context";
import {Logger} from "./counter_component";

export const loggerInjectionKey = Symbol() as SymbolKey<Logger>;