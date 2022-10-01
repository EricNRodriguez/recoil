/** @jsx jsx */

import {WElement, WNode} from "recoiljs-dom";
import {loggerInjectionKey} from "./constant";
import {jsx, $, For} from "recoiljs-dom-jsx";
import {inject, runMountedEffect, createComponent, onInitialMount} from "recoiljs-component";
import {EffectPriority} from "recoiljs-atom";

export const Log = createComponent((): WElement<HTMLElement> => {
  return (
    <div className={"logs"}>
      <h3>Logs:</h3>
      <LogContent/>
    </div>
  );
});

const LogContent = createComponent((): WElement<HTMLElement> => {
  const logger = inject(loggerInjectionKey)!;

  // explicitly running below the priority of render effects (HIGH)
  let container = undefined;
  onInitialMount(() => {
    container = document.getElementById("logcontentcontainer")!;
    console.log(container);
  })
  runMountedEffect((): void => {
    logger.getLogs();

    const container = document.getElementById("logcontentcontainer")!;
    container.scrollTop = container.scrollHeight;
  }, EffectPriority.MINOR);


  return (
    <div className={"log"} onscroll={() => console.log("scrolling!")} id={"logcontentcontainer"}>
      <For
        items={() => logger.getLogs().map((log, idx) => [idx.toString(), [idx, log]])}
        render={([index, content]: [number, string]) => <BlockText content={content} index={index} />}
      />
    </div>
  );
});

type BlockTextProps = {
  index: number;
  content: string;
};

const BlockText = (props: BlockTextProps): WElement<HTMLElement> => {
  const className = `block-text ${props.index % 2 == 0 ? "red" : "green"}`;
  return (
    <p className={className}>
      {`${props.index}: ${props.content}`}
    </p>
  );
};
