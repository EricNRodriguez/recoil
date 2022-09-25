import { div, suspense, lazy, button, ifElse } from "recoiljs-dom-dsl";
import { WNode } from "recoiljs-dom";
import { createState } from "recoiljs-atom";

const someArbitrarilyLargeComponent = lazy(async () => {
  await new Promise((res) => setTimeout(res, 1000));
  return import("./split_component");
});

export const app = (): WNode<Node> => {
  const isLargeComponentVisible = createState(false);

  const handleButtonClick = (e: Event) => {
    isLargeComponentVisible.update((v) => !v);
  };

  return div(
    { className: "wrapper-div" },
    button(
      { onclick: handleButtonClick, disabled: isLargeComponentVisible },
      "Show Large Component"
    ),
    ifElse({
      condition: isLargeComponentVisible,
      ifTrue: () =>
        suspense(
          { fallback: div("loading....") },
          someArbitrarilyLargeComponent()
        ),
    })
  );
};
