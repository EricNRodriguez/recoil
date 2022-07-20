import {createComponent, onInitialMount, onMount, onUnmount, runMountedEffect} from "../../../packages/dom-component";
import {HtmlVElement, HtmlVNode} from "../../../packages/vdom";
import {Atom, createState} from "../../../packages/atom";
import {button, div, hr, ifElse, t} from "../../../packages/dom-dsl";

export const coupledCounter = createComponent((onEMount: () => void): HtmlVElement => {
  const a = createState<number>(0);
  const b = createState<number>(0);
  const c = createState<number>(0);

  const state = createState<boolean>(true);

  const incAButton = button({
    content: "a++",
    onClick: (): void => a.set(a.get()+1),
  });

  const incBButton = button({
    content: "b++",
    onClick: (): void => b.set(b.get()+1),
  });

  const incCButton = button({
    content: "c++",
    onClick: (): void => c.set(c.get()+1),
  });

  const flipStateButton = button({
    content: "flip state",
    onClick: (): void => state.set(!state.get()),
  });

  return div(
    incAButton,
    incBButton,
    incCButton,
    flipStateButton,
    hr(),
    ifElse(
      state,
      dComponent(a,b),
      eComponent(a,b,c, onEMount),
    ),
  );
});

const dComponent = createComponent((a: Atom<number>, b: Atom<number>): HtmlVNode => {

  runMountedEffect((): void => {
    a.get();
    b.get();
    console.log("dComponent was updated");
  });

  onMount(() => console.log("dComponent mounted"));
  onUnmount(() => console.log("dComponent unmounted"));

  const elem = div(
    div("d content"),
    div(
      t((): string => (a.get() + b.get()).toString())
    ),
  );

  return elem;
});

const eComponent = createComponent((a: Atom<number>, b: Atom<number>, c: Atom<number>, onFirstMount: () => void): HtmlVNode => {

  runMountedEffect((): void => {
    a.get();
    b.get();
    c.get();

    console.log("eComponent was updated");
  });

  onMount(() => console.log("eComponent mounted"));
  onUnmount(() => console.log("eComponent unmounted"));
  onInitialMount(() => console.log("E COMPONENT INITIAL MOUNT CALLED"));
  onInitialMount(onFirstMount);

  const elem = div(
    div("e content"),
    div(
      t((): string => (a.get() + b.get() + c.get()).toString())
    ),
  );

  return elem;
});