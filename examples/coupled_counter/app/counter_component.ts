import {createComponent, onInitialMount, onMount, onUnmount, runMountedEffect} from "../../../packages/dom-component";
import {HtmlVElement, HtmlVNode} from "../../../packages/vdom";
import {Atom, createState, state} from "../../../packages/atom";
import {br, button, div, hr, ifElse, t} from "../../../packages/dom-dsl";
import {log} from "./log_component";

class Logger {
    @state()
    private logs: string[] = [];

    public logMessage(msg: string): void {
      this.logs = [
        ...this.logs,
        msg,
      ];
    }

    public getLogs(): string[] {
      return this.logs;
    }
}

export const coupledCounter = createComponent((): HtmlVElement => {
  const logger = new Logger();

  const a = createState<number>(0);
  const b = createState<number>(0);
  const c = createState<number>(0);

  const state = createState<boolean>(true);

  const incAButton = button({
    content: "a++",
    onClick: (): void => a.set(a.get()+1),
  });

  const incBButton = button({
    content: "b++",
    onClick: (): void => b.set(b.get()+1),
  });

  const incCButton = button({
    content: "c++",
    onClick: (): void => c.set(c.get()+1),
  });

  const flipStateButton = button({
    content: "flip state",
    onClick: (): void => state.set(!state.get()),
  });

  return div(
    incAButton,
    incBButton,
    incCButton,
    flipStateButton,
    br(),
    ifElse(
      state,
      dComponent(logger, a,b),
      eComponent(logger, a,b,c),
    ),
    hr(),
    log(() => logger.getLogs()),
  );
});

const dComponent = createComponent((logger: Logger, a: Atom<number>, b: Atom<number>): HtmlVNode => {

  runMountedEffect((): void => {
    a.get();
    b.get();
    logger.logMessage("dComponent was updated");
  });

  onMount(() => logger.logMessage("dComponent mounted"));
  onUnmount(() => logger.logMessage("dComponent unmounted"));

  const elem = div(
    div("d content"),
    div(
      t((): string => (a.get() + b.get()).toString())
    ),
  );

  return elem;
});

const eComponent = createComponent((logger: Logger, a: Atom<number>, b: Atom<number>, c: Atom<number>): HtmlVNode => {

  runMountedEffect((): void => {
    a.get();
    b.get();
    c.get();

    logger.logMessage("eComponent was updated");
  });

  onMount(() => logger.logMessage("eComponent mounted"));
  onUnmount(() => logger.logMessage("eComponent unmounted"));
  onInitialMount(() => logger.logMessage("eComponent initial mount called"));

  const elem = div(
    div("e content"),
    div(
      t((): string => (a.get() + b.get() + c.get()).toString())
    ),
  );

  return elem;
});