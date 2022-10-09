import { createState, fetchState, IMutableAtom } from "recoiljs-atom";
import { div, h3, hr, input, p, t } from "recoiljs-dom-dsl";

export const time = () => {
  const area = createState<string>("");
  const location = createState<string>("");
  const region = createState<string>("");

  const time = fetchState<number>((): Promise<number> => {
    console.log("fetchstate running");
    return fetch(
      `http://worldtimeapi.org/api/timezone/${area.get()}/${location.get()}/${region.get()}`
    )
      .then((rsp: Response): any => {
        return rsp.json();
      })
      .then((rsp: any): number => {
        return rsp["datetime"] ?? "invalid area/location/region";
      });
  });

  return div(
    h3("This example shows the fetchState hook"),
    p(
      "As an example, type 'Australia' into the area input and 'Sydney' into the location input, and keep an eye on the network requests"
    ),
    hr(),
    formTextInput("area", area),
    formTextInput("location", location),
    formTextInput("region", region),
    hr(),
    t(time.map((v) => v ?? ""))
  );
};

const formTextInput = (name: string, atom: IMutableAtom<String>) => {
  const textInputElem = input({
    type: "text",
    oninput: (e: Event) => atom.set(textInputElem.value),
  });

  return div(`${name}:`, textInputElem);
};
