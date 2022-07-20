import {HtmlVElement} from "../../../packages/vdom";
import {createComponent} from "../../../packages/dom-component";
import {div, foreach, h3, p, t} from "../../../packages/dom-dsl";

export const log = createComponent((getLogs: () => string[]): HtmlVElement => {
    return div(
      h3("Logs:"),
      foreach(
        () => getLogs().map((log, index) => [index.toString(), log]),
        blockText,
      )
    )
});

const blockText = createComponent((content: string): HtmlVElement => {
    return p(content);
});