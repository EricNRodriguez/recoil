import {buildFactory, AtomFactory, LeafAtom, DerivedAtom} from "../packages/atom";
import {p, div, t, h1, h2} from "../packages/dom_dsl";

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

console.log(c.get());
a.set(5);
b.set(5);
console.log(c.get());

let cInUI: number | null = null;
f.createEffect((): void => {
    cInUI = c.get();
});

console.log(cInUI);

a.set(-10000);


const app = div(
    h1(
        t("h1")
    ),
    h2(
        t(() => a.get().toString()),
    ),
    p(
        t("paragraph"),
    ),
    t("text"),
    div(),
    p(),
);





