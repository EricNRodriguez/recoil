/** @jsx jsx */

import {WElement, WNode} from "recoiljs-dom";
import {IAtom, createState, state, runUntracked, IMutableAtom, deriveState, runBatched} from "recoiljs-atom";
import {br, button, div, hr, ifElse, t} from "recoiljs-dom-dsl";
import {createComponent, runMountedEffect, onMount, onUnmount, onInitialMount, inject, makeLazy} from "recoiljs-component";
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

export const CoupledCounter = createComponent(() => {
  const a = createState<number>(0);
  const b = createState<number>(0);
  const c = createState<number>(0);

  const state = createState<boolean>(true);

  runMountedEffect(() => {
      console.log(`state value is: ${state.get()}`);
  });

  const incAButton = button({onclick: () => a.update(v => v+1)},
    "a++",
  );

  const incBButton = button({onclick: () => b.update(v => v+1)},
    "b++",
  );

  const incCButton = button({onclick: () => c.update(v => v+1)},
    "c++",
  );

  const flipStateButton = button({onclick: () => state.update(v => !v)},
    "flip state",
  );

  return (
      <div>
        {incAButton}
        {incBButton}
        {incCButton}
        {flipStateButton}
        <br />
        <If
          condition={state}
          true={makeLazy(() => <DComponent a={a} b={b} />)}
          false={makeLazy(() => <EComponent a={a} b={b} c={c} />)}
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

const DComponent = createComponent((props: dComponentProps) => {
  const logger = inject(loggerInjectionKey)!;
  const {a, b} = props;

  runMountedEffect((): void => {
    a.get();
    b.get();

    console.log("DComponent updated!!");

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

const EComponent = createComponent((props: eComponentProps,) => {
  const logger = inject(loggerInjectionKey)!;
  const {a, b, c} = props;

  runMountedEffect((): void => {
    a.get();
    b.get();
    c.get();

    console.log("EComponent updated!!");

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
