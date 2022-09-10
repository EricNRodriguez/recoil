import { SymbolKey } from "../../../packages/component";
import { Logger } from "./counter_component";

export const loggerInjectionKey = Symbol() as SymbolKey<Logger>;
