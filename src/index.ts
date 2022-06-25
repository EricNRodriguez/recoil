import {buildFactory, AtomFactory, LeafAtom, DerivedAtom} from "../packages/atom";
import {p, div, t, h1, h2, ifElse, foreach} from "../packages/dom_dsl";
import {runApp} from "../packages/dom_dsl/src/run_app";

const f: AtomFactory = buildFactory();

const a: LeafAtom<number> = f.buildAtom(2);
a.react((value: number): void => {
    console.log(`effect on a: ${value}`);
});

const b: LeafAtom<number> = f.buildAtom(3);
b.react((value: number): void => {
    console.log(`effect on b: ${value}`);
});

const c: DerivedAtom<number> = f.deriveAtom(() => a.get() + b.get());
c.react((value: number): void => {
    console.log(`effect on c: ${value}`);
});

c.get();

console.log("=====");

a.set(0);

console.log("=======");

b.set(5);
a.set(2);


const header = h1(
    t("h1")
).withClassName("6");

const subHeader = h2(
    t(() => a.get().toString()),
);

const paragraph = p(
    t("paragraph"),
);

const app = div(
    header,
    subHeader,
    paragraph,
    t("text"),
    div().withClassName('shit'),
    ifElse(
        () => a.get() === 2,
        div(t("a is 2!")),
        div(t(() => `a is not 2, it is ${a.get()}`)),
    ),
    foreach(
        () => [1,2,3,4,5,6,7,8],
        (value: number): Node => div(t(value.toString)),
    ),
    p(),
);

runApp(
    document.getElementById("root") as HTMLElement,
    app.withClassName("root-div").withId("root-id"),
);





