import {HtmlVElement} from "recoil/packages/vdom";
import {createComponent, onInitialMount, runMountedEffect} from "recoil/packages/dom-component";
import {div, foreach, h3, p, t} from "recoil/packages/dom-dsl";

export const log = createComponent((getLogs: () => string[]): HtmlVElement => {
  const style = {
    "height": "200px",
    "overflow-y": "auto",
  };

  const logContent = div(
    foreach(
      () => getLogs().map((log, index) => [index.toString(), [index, log]]),
      blockText
    ),
  ).setStyle(style);

  runMountedEffect((): void => {
    // track the logs
    // TODO(ericr): implement an 'beforeUpdate' and 'afterUpdate' hook
    getLogs();

    // run as a low priority job - i.e. after all the other updates...
    queueMicrotask((): void => {
      const raw = logContent.getRaw() as HTMLElement;
      raw.scrollTop = raw.scrollHeight;
    });
  });

  return div(
      h3("Logs:"),
      logContent,
    )
});

const blockText = createComponent(([index, content]: [number, string]): HtmlVElement => {
    const style = {
      "background-color": index % 2 === 0 ? "red" : "green",
      "margin-top": "0px",
      "margin-bottom": "0px",
    };

    return p(content)
      .setStyle(style);
});