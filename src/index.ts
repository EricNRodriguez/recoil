import {buildFactory, AtomFactory, LeafAtom, DerivedAtom} from "../packages/atom";
import {p, div, t, h1, h2} from "../packages/dom_dsl";
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

//
// const app = div(
//     h1(
//         t("h1")
//     ).withClassName("6"),
//     h2(
//         t(() => a.get().toString()),
//     ),
//     p(
//         t("paragraph"),
//     ),
//     t("text"),
//     div().withClassName('shit'),
//     p(),
// ).withClassName("root-div").withId("root-id");
//
// console.log(app.id);
// console.log(app.className);
//
// runApp(
//     document.getElementById("root") as HTMLElement,
//     app,
// );





