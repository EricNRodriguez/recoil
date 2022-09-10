/** @jsx jsx */

import {WElement, WNode} from "recoiljs-dom";
import {loggerInjectionKey} from "./constant";
import {jsx, $, For} from "recoiljs-dom-jsx";
import {inject, runMountedEffect, withContext} from "recoiljs-context";

export const Log = withContext((): WElement<HTMLElement> => {
  return (
    <div className={"logs"}>
      <h3>Logs:</h3>
      <LogContent/>
    </div>
  );
});

const LogContent = withContext((): WElement<HTMLElement> => {
  let container: WElement<HTMLDivElement> | undefined = undefined;
  const logger = inject(loggerInjectionKey)!;

  runMountedEffect((): void => {
    logger.getLogs();

    // run as a low priority job - i.e. after all the other updates...
    queueMicrotask((): void => {
      container!.unwrap().scrollTop = container!.unwrap().scrollHeight;
    });
  });


  container = (
    <div className={"log"} onscroll={() => console.log("scrolling!")}>
      <For
        items={() => logger.getLogs().map((log, idx) => [idx.toString(), [idx, log]])}
        render={([index, content]: [number, string]) => <BlockText content={content} index={index} />}
      />
    </div>
  );

  return container!;
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
