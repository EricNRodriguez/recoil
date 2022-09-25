# Overview

A runtime dsl that provides a higher level abstraction over the `dom` api. This includes control components that enable dom trees to be specified declaratively, and one way data binding for atomic properties.

> NOTE: At this point in time, the only reactive library that is supported is `atom`. This was a practical decision given the scope of this project, however it should be relatively simple to add bindings at runtime via DI. 


# API

#### Mounting An Application

```ts
const runApp = (anchor: HTMLElement, app: WNode<Node>): void;
```

#### Creating Elements

DSL methods are provided for the majority of dom elements specified by the [mozilla HTML element reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element).  See `elements.ts` for a more detailed reference.

#### Defining The Dom Structure

A set of control components based around the `atom` library enable declerative UI to be built. This includes:
- `forEach`
- `ifElse`
- `match`
- `suspense`

# Example

```ts
import {deriveState} from "recoiljs-atom";

export const coupledCounter = createComponent((): HtmlVElement => {
  const logger = new Logger();

  const a = createState<number>(0);
  const b = createState<number>(0);
  const c = createState<number>(0);

  const showDComponent = createState<boolean>(true);

  const incAButton = button({onclick: (): void => a.set(a.get() + 1)},
    "a++",
  );

  const incBButton = button({onclick: (): void => b.set(b.get() + 1)},
    "b++",
  );

  const incCButton = button({onclick: (): void => c.set(c.get() + 1)},
    "c++",
  );

  const flipStateButton = button({onclick: (): void => showDComponent.set(!showDComponent.get())},
    "flip",
  );

  return div({className: "coupled-counter-outer-div"},
    incAButton,
    incBButton,
    incCButton,
    flipStateButton,
    br(),
    ifElse(
      showDComponent,
      dComponent(logger, a, b),
      eComponent(logger, a, b, c),
    ),
    hr(),
    log(() => logger.getLogs()),
  );
});

const dComponent = createComponent((logger: Logger, a: Atom<number>, b: Atom<number>): HtmlVNode => {
  const content = deriveState(() => a.get() + b.get());

  runMountedEffect((): void => {
    content.get();
s
    runUntracked(() => {
      logger.logMessage("dComponent was updated");
    });
  });

  onMount(() => runUntracked(() => logger.logMessage("dComponent mounted")));
  onUnmount(() => runUntracked(() => logger.logMessage("dComponent unmounted")));

  const elem = div(
    div("d content"),
    div(
      t(content.transform(toString)),
    ),
  );

  return elem;
});

const eComponent = createComponent((logger: Logger, a: Atom<number>, b: Atom<number>, c: Atom<number>): HtmlVNode => {
  const content = deriveState(() => a.get() + b.get() + c.get());
  
  runMountedEffect((): void => {
    content.get();

    logger.logMessage("eComponent was updated");
  });

  onMount(() => runUntracked(() => logger.logMessage("eComponent mounted")));
  onUnmount(() => runUntracked(() => logger.logMessage("eComponent unmounted")));
  onInitialMount(() => runUntracked(() => logger.logMessage("eComponent initial mount called")));

  const elem = div({className: "eComponent-outer-div"},
    div("e content"),
    div({className: "text-wrapper-div"},
      t(content.transform(toString))
    ),
  );

  return elem;
});
```


