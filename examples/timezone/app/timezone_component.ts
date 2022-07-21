import {createComponent} from "recoil/packages/dom-component";
import {HtmlVElement, HtmlVNode} from "recoil/packages/vdom";
import {createState, fetchState, LeafAtom} from "recoil/packages/atom";
import {div, h3, hr, p, t, textInput} from "recoil/packages/dom-dsl";

export const time = createComponent((): HtmlVElement => {
  const area = createState<string>("");
  const location = createState<string>("")
  const region = createState<string>( "");

  const time = fetchState<number>((): Promise<number> => {
    return fetch(`http://worldtimeapi.org/api/timezone/${area.get()}/${location.get()}/${region.get()}`)
      .then((rsp: Response): any => {
        return rsp.json();
      }).then((rsp: any): number => {
        return rsp["datetime"] ?? "invalid area/location/region";
      });
  });

  return div(
    h3("This example shows the fetchState hook"),
    p("As an example, type 'Australia' into the area input and 'Sydney' into the location input, and keep an eye on the network requests"),
    hr(),
    formTextInput("area", area),
    formTextInput("location", location),
    formTextInput("region", region),
    hr(),
    t((): string => time.get()?.toString() ?? ""),
  )
});

const formTextInput = (name: string, atom: LeafAtom<String>): HtmlVNode => {
  return div(
    `${name}:`,
    textInput(atom),
  );
};
