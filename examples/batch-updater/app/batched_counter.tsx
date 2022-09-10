/** @jsx jsx */

import {createState, deriveState, IAtom, IMutableAtom, isAtom, runBatched, runUntracked} from "recoiljs-atom";
import {button, div, h3, hr} from "recoiljs-dom-dsl";
import {createTextNode, WElement, WNode} from "recoiljs-dom";
import {createComponent, runMountedEffect} from "recoiljs-component";
import {jsx, $} from "recoiljs-dom-jsx";

export const BatchedCounter = (): WNode<Node> => {
  return (
    <div>
      <h3>
        batched update example
      </h3>
      <EffectExecutionCounterExample shouldBatchUpdates={true} />
      <hr />
      <h3>
        unbatched update example
      </h3>
      <EffectExecutionCounterExample shouldBatchUpdates={false} />
    </div>
  );
};

type EffectExecutionCounterExampleProps = {
  shouldBatchUpdates: boolean;
};

const EffectExecutionCounterExample = createComponent((props: EffectExecutionCounterExampleProps): WElement<HTMLElement> => {
  const numberOfTimesEffectHasRun = createState<number>(0);

  const a = createState<number>(0);
  const b = createState<number>(0);
  const c = deriveState<number>(() => a.get() + b.get());

  runMountedEffect(() => {
    c.get();
    runUntracked(() => numberOfTimesEffectHasRun.update((v) => v + 1));
  });

  const onClick = () => {
    console.log("on click!");
      const updateJob = () => {
        a.update((v) => v+1);
        b.update((v) => v+1);
      };

      if (props.shouldBatchUpdates) {
        runBatched(updateJob);
      } else {
        updateJob();
      }
    };

  return (
    <div>
      <ValueDisplay name={"a"} value={a} />
      <ValueDisplay name={"b"} value={b} />
      <button onclick={onClick}>
        add one to a and b
      </button>
      <ValueDisplay name={"number of times mounted effect was run"} value={numberOfTimesEffectHasRun} />
    </div>
  );
});

type ValueDisplayProps = {
    name: string;
    value: IMutableAtom<number>;
};

const ValueDisplay = (props: ValueDisplayProps): WNode<Node> => {
  const strValue = deriveState(() => props.value.get().toString());

  return (
      <div>
        value of {props.name} is: {$(strValue)}
      </div>
  );
};

