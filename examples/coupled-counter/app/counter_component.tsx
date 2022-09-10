/** @jsx jsx */

import {WElement, WNode} from "recoiljs-dom";
import {IAtom, createState, state, runUntracked, IMutableAtom, deriveState} from "recoiljs-atom";
import {br, button, div, hr, ifElse, t} from "recoiljs-dom-dsl";
import {withContext, runMountedEffect, onMount, onUnmount, onInitialMount, inject, captureContextState} from "recoiljs-context";
import {Log} from "./log_component";
import {loggerInjectionKey} from "./constant";
import {jsx, $, If, For} from "recoiljs-dom-jsx";

export class Logger {
    private logs: IMutableAtom<string[]> = createState<string[]>([]);

    public logMessage(msg: string): void {
      this.logs.update((lgs: string[]) => [...lgs, msg]);
    }

    public getLogs(): string[] {
      return this.logs.get();
    }
}

export const CoupledCounter = withContext((): WElement<HTMLElement> => {
  const a = createState<number>(0);
  const b = createState<number>(0);
  const c = createState<number>(0);

  const state = createState<boolean>(true);

  runMountedEffect(() => {
      console.log(`state value is: ${state.get()}`);
  });

  const incAButton = button("a++")
    .setEventHandler("click", () => a.update(v => v+1));

  const incBButton = button("b++")
    .setEventHandler("click", (event: MouseEvent) => b.update(v => v+1));

  const incCButton = button("c++")
    .setEventHandler("click", () => c.update(v => v+1));

  const flipStateButton = button("flip state")
    .setEventHandler("click", () => state.update(v => !v));

  return (
      <div>
        {incAButton}
        {incBButton}
        {incCButton}
        {flipStateButton}
        <br />
        <If
          condition={state}
          true={captureContextState(() => <DComponent a={a} b={b} />)}
          false={captureContextState(() => <EComponent a={a} b={b} c={c} />)}
        />
        <hr />
        <Log />
      </div>
  );
});

export type dComponentProps = {
  a: IAtom<number>;
  b: IAtom<number>;
}

const DComponent = withContext((props: dComponentProps): WElement<HTMLElement> => {
  const logger = inject(loggerInjectionKey)!;
  const {a, b} = props;

  runMountedEffect((): void => {
    a.get();
    b.get();

    runUntracked(() => {
      logger.logMessage("dComponent was updated");
    });
  });

  onMount(() => runUntracked(() => logger.logMessage("dComponent mounted")));
  onUnmount(() => runUntracked(() => logger.logMessage("dComponent unmounted")));

  return (
    <div>
      <h4>d content</h4>
      {$(() => a.get() + b.get())}
    </div>
  );
});

export type eComponentProps = {
    a: IAtom<number>;
    b: IAtom<number>;
    c: IAtom<number>;
};
const toString = (v: any) => v.toString();

const EComponent = withContext((props: eComponentProps,): WElement<HTMLElement> => {
  const logger = inject(loggerInjectionKey)!;
  const {a, b, c} = props;

  runMountedEffect((): void => {
    a.get();
    b.get();
    c.get();

    runUntracked(() => logger.logMessage("EComponent was updated"));
  });

  onMount(() => runUntracked(() => logger.logMessage("EComponent mounted")));
  onUnmount(() => runUntracked(() => logger.logMessage("EComponent unmounted")));
  onInitialMount(() => runUntracked(() => logger.logMessage("EComponent initial mount called")));

  return (
    <div className={a.map(toString)} onclick={(e) => console.log("clicked!!!")}>
     <h4>e component</h4>
      {$(() => a.get() + b.get() + c.get())}
    </div>
  );
});