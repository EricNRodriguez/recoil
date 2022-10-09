/** @jsx jsx */

import {WElement, WNode} from "recoiljs-dom";
import {loggerInjectionKey} from "./constant";
import {jsx, $, For} from "recoiljs-dom-jsx";
import {inject, runMountedEffect, createComponent} from "recoiljs-component";
import {EffectPriority} from "recoiljs-atom";

export const Log = createComponent(() => {
  return (
    <div className={"logs"}>
      <h3>Logs:</h3>
      <LogContent/>
    </div>
  );
});

const LogContent = createComponent(() => {
  const logger = inject(loggerInjectionKey)!;

  const container = (
    <div className={"log"} onscroll={() => console.log("scrolling!")}>
      <For
        items={() => logger.getLogs().map((log, idx) => [idx.toString(), [idx, log]])}
        render={([index, content]: [number, string]) => <BlockText content={content} index={index} />}
      />
    </div>
  );

  runMountedEffect((): void => {
    logger.getLogs();

    container!.scrollTop = container!.scrollHeight;
  }, EffectPriority.MINOR);

  return container!;
});

type BlockTextProps = {
  index: number;
  content: string;
};

const BlockText = (props: BlockTextProps) => {
  const className = `block-text ${props.index % 2 == 0 ? "red" : "green"}`;
  return (
    <p className={className}>
      {`${props.index}: ${props.content}`}
    </p>
  );
};
