interface Supplier<T> {
    (): T;
}
interface Method<T, I, O> {
    (this: T, input: I): O;
}
interface Producer<T> {
    (): T;
}
interface Consumer<T> {
    (value: T): void;
}
interface Runnable {
    (): void;
}
interface Function$1<I, O> {
    (input: I): O;
}
interface Function$1<I, O> {
    (value: I): O;
}

interface ISideEffectRef {
    activate(): void;
    deactivate(): void;
}
interface IAtom<T> {
    get(): T;
    getUntracked(): T;
    invalidate(): void;
    map<R>(transform: Function$1<T, R>): IAtom<R>;
}
interface ILeafAtom<T> extends IAtom<T> {
    set(value: T): void;
    update(fn: (val: T) => T): void;
}

/**
 * A generic higher order function
 */
declare type FunctionDecorator<F extends Function> = (fn: F) => F;
/**
 * Registers a runtime decorator against one of the public factory methods exposed by this module.
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be applied for all subsequent calls of the apiFn
 */
declare const registerDecorator: <F extends Function>(apiFn: F, decorator: FunctionDecorator<F>) => void;
/**
 * De-registers decorators that have been applied to the provided apiFn (i.e. createState etc)
 *
 * @param apiFn The exposed function
 * @param decorator The higher order decorator to be removed
 */
declare const deregisterDecorator: <F extends Function>(apiFn: F, decorator: FunctionDecorator<F>) => void;
declare type FetchStateSignature<T> = (fetch: () => Promise<T>) => IAtom<T | undefined>;
/**
 * A lightweight primitive that allows state to be fetched asynchronously and written to a reactive atom. Before
 * resolving, the returned atom will have an undefined value.
 *
 * @param producer A synchronous builder for an asynchronous value. It is important that all dependencies that invalidate
 *                 the returned state are read synchronously (i.e. before any async execution). You should think of this
 *                 as a synchronous factory that produces a promise, with this factory being re-run every time its dependencies
 *                 change.
 * @returns A maybe atom containing the fetched state (or undefined in the instance when the state is being fetched)
 */
declare const fetchState: <T>(producer: Producer<Promise<T>>) => IAtom<T | undefined>;
declare type CreateStateSignature<T> = (value: T) => ILeafAtom<T>;
/**
 * A factory method for a leaf atom instance.
 *
 * @param value The value to be stored in the atom.
 * @returns The atom
 */
declare const createState: <T>(value: T) => ILeafAtom<T>;
declare type DeriveStateSignature<T> = (derivation: () => T) => IAtom<T>;
/**
 * A factory method for a derived state.
 *
 * The returned atom is dirtied whenever any atomic dependencies used within the
 * derivation are dirtied. Evaluation can either be lazy or eager, depending on
 * the effects registered against it.
 *
 * Which computations to wrap in cached derivations should be considered carefully, ideally through profiling. This
 * is because all writes to leaf atoms have a linear time complexity on the depth of the dependency DAG. Hence,
 * they should be used as tracked cache (memoization) primitive.
 *
 * @param deriveValue A synchronous factory for the state
 * @param cache Determines if the returned Atom is a skip connection in the DAG or an actual node.
 * @returns An atom containing the derived state, which automatically tracks the dependencies that were used to
 *          create it
 */
declare const deriveState: <T>(deriveValue: Producer<T>, cache?: boolean) => IAtom<T>;
declare type RunEffectSignature = (effect: Runnable) => ISideEffectRef;
/**
 * A factory method for a tracked side effect
 *
 * The effect will be eagerly run once, and again any time any of its dependencies become dirty.
 *
 * It is important that this side effect is state-free, i.e. writes to atoms should be done with extreme
 * caution, as they can easily create reactive loops that are extremely difficult to find.
 *
 * As this is effectively a leaf in the dependency DAG, a reference to the side effect is returned that
 * should be managed by the caller. It provides lifecycle methods for the effect and also ensures that the
 * effect is not garbage collected. Despite this, it is recommended that this function should be decorated with
 * auto-scoping logic that handles reference management instead of doing it ad-hoc.
 *
 * @param effect The side effect
 * @returns A reference to the side effect (see the above doc)
 */
declare const runEffect: RunEffectSignature;
/**
 * A utility decorator that auto-wraps instance variables in atoms, and overrides the set and get methods
 * such that they write/read to the atom.
 */
declare const state: () => void | any;
/**
 * A utility decorator that auto-wraps methods in derived atoms.
 */
declare const derivedState: () => string | any;
/**
 * Executes a callback that is not tracked by external contexts. I.e. reads made within the callback
 * will be made outside any external tracking scopes.
 *
 * @param job The callback to execute in an untracked context
 */
declare const runUntracked: <T>(job: Producer<T>) => T;
/**
 * Executes a job in a batched context, such that all eager side effects will be run after the job returns.
 * This is typically useful if you have an invalid intermediate state that is invalid and should never be used
 * in any effects.
 *
 * @param job The job to be run in a batched state, with all effects running after the job completes.
 */
declare const runBatched: (job: Runnable) => void;

declare const isAtom: (obj: any) => boolean;

declare abstract class BaseWNode<A extends Node, B extends BaseWNode<A, B>> {
    private parent;
    private readonly node;
    private readonly isDocumentFragment;
    private readonly children;
    private readonly onMountHooks;
    private readonly onUnmountHooks;
    private currentlyMounted;
    protected constructor(node: A);
    private isFragment;
    setProperty<T>(prop: string, value: T): B;
    private getUnpackedChildren;
    getChildren(): WNode<Node>[];
    private rebindChildren;
    setChildren(children: (WNode<Node> | Node | null | undefined)[]): B;
    syncMountStatusOfChild(child: WNode<Node>): void;
    isMounted(): boolean;
    private setParent;
    getParent(): WNode<Node> | null;
    mount(): B;
    unmount(): B;
    private runUnmountHooks;
    private runMountHooks;
    registerOnMountHook(hook: Runnable): B;
    registerOnUnmountHook(hook: Runnable): B;
    unwrap(): A;
}
declare class WNode<T extends Node> extends BaseWNode<T, WNode<T>> {
    constructor(node: T);
}
declare const isWNode: (content: any) => boolean;

declare class GlobalEventCoordinator {
    private readonly eventTargets;
    private readonly targetHandlers;
    attachEventHandler<K extends keyof HTMLElementEventMap>(event: K, target: EventTarget, handler: Consumer<HTMLElementEventMap[K]>): void;
    detachEventHandlers<K extends keyof HTMLElementEventMap>(event: K, target: EventTarget): void;
    private executeHandlersBottomUp;
}

declare abstract class BaseWElement<A extends HTMLElement, B extends BaseWElement<A, B>> extends BaseWNode<A, B> {
    private readonly eventCoordinator;
    constructor(element: A, eventCoordinator: GlobalEventCoordinator);
    setAttribute(attribute: string, value: string): B;
    setEventHandler<K extends keyof HTMLElementEventMap>(type: K, listener: Method<HTMLElement, HTMLElementEventMap[K], void>, delegate?: boolean): B;
}
declare class WElement<T extends HTMLElement> extends BaseWElement<T, WElement<T>> implements WNode<T> {
    constructor(elem: T, eventCoordinator: GlobalEventCoordinator);
}

declare type RawOrBinded$1<T> = IAtom<T> | T;
declare type Props = Record<string, RawOrBinded$1<any>>;
declare type Children = WNode<Node>[];
declare const createElement: <K extends keyof HTMLElementTagNameMap>(tag: K | HTMLElementTagNameMap[K], props: Props, children: Children) => WElement<HTMLElementTagNameMap[K]>;
declare const createTextNode: (text: RawOrBinded$1<string>) => WNode<Text>;
declare const createFragment: (children: Children) => WNode<DocumentFragment>;

declare type DefaultModuleType = {
    default: (...args: any[]) => WNode<Node>;
};
declare const lazy: (getModule: () => Promise<DefaultModuleType>) => (...args: any[]) => Promise<WNode<Node>>;

/**
 * A typesafe key for a symbol in the symbol table.
 */
interface SymbolKey<T> extends Symbol {
}
declare class SymbolTable {
    private readonly symbols;
    fork(): SymbolTable;
    set<T>(key: SymbolKey<T>, value: T): void;
    get<T>(key: SymbolKey<T>): T | undefined;
}
declare class ExecutionScopeManager {
    private currentScope;
    getCurrentScope(): SymbolTable;
    /**
     * Decorates the provided function such that it runs in a child scope of the current scope at the time
     * of execution.
     *
     * @param fn The function to be decorated
     */
    withChildScope<Args extends unknown[], ReturnType>(fn: (...args: [...Args]) => ReturnType): (...args_0: Args) => ReturnType;
    /**
     * Decorates the provided function such that whenever the returned function is called, it executes the provided
     * function with the current scope at the time this function is called - i.e. it forms a closure over the current
     * scope at the time it is decorated.
     *
     * @param fn The function to be decorated.
     */
    withCurrentScope<Args extends unknown[], ReturnType>(fn: (...args: [...Args]) => ReturnType): (...args_0: Args) => ReturnType;
}

declare const defer: (deferredFunction: Consumer<WElement<HTMLElement>>) => void;
declare const onInitialMount: (fn: Runnable) => void;
declare const onMount: (fn: Runnable) => void;
declare const onUnmount: (fn: Runnable) => void;
/**
 * Runs a side effect against the dom subtree enclosed by this context
 *
 * The effect will be automatically activated/deactivated with the mounting/unmounting
 * of the context, preventing unnecessary background updates to the dom.
 *
 * @param sideEffect The side effect that will be re-run every time its deps are dirtied.
 */
declare const runMountedEffect: (sideEffect: Runnable) => void;
/**
 * A type safe DI provider analogous to that provided by the vue composition API.
 *
 * @param key The injection key.
 * @param value The raw value.
 */
declare const provide: <T>(key: SymbolKey<T>, value: T) => void;
/**
 * Returns the value registered against the key, in the current components scope.
 *
 * This is a tracked operation.
 *
 * @param key The injection key.
 */
declare const inject: <T>(key: SymbolKey<T>) => T | undefined;
/**
 * Decorates the provided component with a context, allowing the hooks provided by this api
 * to be used.
 *
 * @param component A context builder
 */
declare const withContext: <Args extends unknown[], ReturnNode extends WElement<HTMLElement>>(component: (...args_0: Args) => ReturnNode) => (...args_0: Args) => ReturnNode;
/**
 * Wraps a callback inside a closure such that the current contexts scope state is captured and restored for each
 * sub-context run inside the callback.
 *
 * At this point in time, the only scoped state contained within the context API is that used by the dependency
 * injection code, however this wrapper fn is intended to be a catch-all single point for wiring in this sort of
 * behaviour for any future behaviour that requires similar hierarchical scope.
 *
 * @param fn The function to close over the current context scope
 */
declare const captureContextState: <Args extends unknown[], ReturnType_1>(fn: (...args_0: Args) => ReturnType_1) => (...args_0: Args) => ReturnType_1;

declare type IndexedItem<T> = [string, T];
declare type ForEachProps<T> = {
    items: Supplier<IndexedItem<T>[]>;
    render: Function$1<T, WNode<Node>>;
};
declare const forEach: <T extends Object>(props: ForEachProps<T>) => WNode<Node>;

declare type IfElseCondition = IAtom<boolean> | Supplier<boolean> | boolean;
declare type IfElseContent = Supplier<WNode<Node>>;
declare type IfElseProps = {
    condition: IfElseCondition;
    ifTrue: IfElseContent;
    ifFalse?: IfElseContent;
};
declare const ifElse: (props: IfElseProps) => WNode<Node>;

declare type MatchProps<T> = {
    state: IAtom<T>;
    render: Function$1<T, WNode<Node>>;
};
declare const match: <T extends Object>(props: MatchProps<T>) => WNode<Node>;

declare type Content = WNode<Node> | string;
declare type RawOrBinded = IAtom<any> | any;
declare type Properties = {
    [key: string]: RawOrBinded;
};
declare type ChildrenOnlyElementBuilder<K extends keyof HTMLElementTagNameMap> = (...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;
declare type PropertiesAndChildrenElementBuilder<K extends keyof HTMLElementTagNameMap> = (properties: Properties, ...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;
declare type EmptyElementBuilder<K extends keyof HTMLElementTagNameMap> = () => WElement<HTMLElementTagNameMap[K]>;
declare type ElementBuilder<K extends keyof HTMLElementTagNameMap> = ChildrenOnlyElementBuilder<K> & PropertiesAndChildrenElementBuilder<K> & EmptyElementBuilder<K>;
declare const html: ElementBuilder<"html">;
declare const base: ElementBuilder<"base">;
declare const head: ElementBuilder<"head">;
declare const link: ElementBuilder<"link">;
declare const meta: ElementBuilder<"meta">;
declare const style: ElementBuilder<"style">;
declare const title: ElementBuilder<"title">;
declare const body: ElementBuilder<"body">;
declare const address: ElementBuilder<"address">;
declare const article: ElementBuilder<"article">;
declare const aside: ElementBuilder<"aside">;
declare const footer: ElementBuilder<"footer">;
declare const header: ElementBuilder<"header">;
declare const h1: ElementBuilder<"h1">;
declare const h2: ElementBuilder<"h2">;
declare const h3: ElementBuilder<"h3">;
declare const h4: ElementBuilder<"h4">;
declare const h5: ElementBuilder<"h5">;
declare const h6: ElementBuilder<"h6">;
declare const main: ElementBuilder<"main">;
declare const nav: ElementBuilder<"nav">;
declare const section: ElementBuilder<"section">;
declare const blockquote: ElementBuilder<"blockquote">;
declare const dd: ElementBuilder<"dd">;
declare const div: ElementBuilder<"div">;
declare const dl: ElementBuilder<"dl">;
declare const dt: ElementBuilder<"dt">;
declare const figcaption: ElementBuilder<"figcaption">;
declare const figure: ElementBuilder<"figure">;
declare const hr: ElementBuilder<"hr">;
declare const li: ElementBuilder<"li">;
declare const menu: ElementBuilder<"menu">;
declare const ol: ElementBuilder<"ol">;
declare const p: ElementBuilder<"p">;
declare const pre: ElementBuilder<"pre">;
declare const ul: ElementBuilder<"ul">;
declare const a: ElementBuilder<"a">;
declare const abbr: ElementBuilder<"abbr">;
declare const b: ElementBuilder<"b">;
declare const bdi: ElementBuilder<"bdi">;
declare const bdo: ElementBuilder<"bdo">;
declare const br: ElementBuilder<"br">;
declare const cite: ElementBuilder<"cite">;
declare const code: ElementBuilder<"code">;
declare const data: ElementBuilder<"data">;
declare const dfn: ElementBuilder<"dfn">;
declare const em: ElementBuilder<"em">;
declare const i: ElementBuilder<"i">;
declare const kbd: ElementBuilder<"kbd">;
declare const mark: ElementBuilder<"mark">;
declare const q: ElementBuilder<"q">;
declare const rp: ElementBuilder<"rp">;
declare const rt: ElementBuilder<"rt">;
declare const ruby: ElementBuilder<"ruby">;
declare const s: ElementBuilder<"s">;
declare const samp: ElementBuilder<"samp">;
declare const small: ElementBuilder<"small">;
declare const span: ElementBuilder<"span">;
declare const string: ElementBuilder<"strong">;
declare const sub: ElementBuilder<"sub">;
declare const sup: ElementBuilder<"sup">;
declare const time: ElementBuilder<"time">;
declare const mvar: ElementBuilder<"var">;
declare const wbr: ElementBuilder<"wbr">;
declare const del: ElementBuilder<"del">;
declare const ins: ElementBuilder<"ins">;
declare const caption: ElementBuilder<"caption">;
declare const col: ElementBuilder<"col">;
declare const colgroup: ElementBuilder<"colgroup">;
declare const table: ElementBuilder<"table">;
declare const tbody: ElementBuilder<"tbody">;
declare const td: ElementBuilder<"td">;
declare const tfoot: ElementBuilder<"tfoot">;
declare const th: ElementBuilder<"th">;
declare const thead: ElementBuilder<"thead">;
declare const tr: ElementBuilder<"tr">;
declare const button: ElementBuilder<"button">;
declare const datalist: ElementBuilder<"datalist">;
declare const fieldset: ElementBuilder<"fieldset">;
declare const form: ElementBuilder<"form">;
declare const input: ElementBuilder<"input">;
declare const label: ElementBuilder<"label">;
declare const legend: ElementBuilder<"legend">;
declare const meter: ElementBuilder<"meter">;
declare const optgroup: ElementBuilder<"optgroup">;
declare const option: ElementBuilder<"option">;
declare const output: ElementBuilder<"output">;
declare const progress: ElementBuilder<"progress">;
declare const select: ElementBuilder<"select">;
declare const textarea: ElementBuilder<"textarea">;
declare const details: ElementBuilder<"details">;
declare const dialog: ElementBuilder<"dialog">;
declare const summary: ElementBuilder<"summary">;
declare const frag: (...children: WNode<Node>[]) => WNode<Node>;
declare type MaybeNode = Node | undefined | null;
declare type MaybeNodeOrVNode = MaybeNode | WNode<Node>;
declare type TextContent = string | IAtom<string>;
declare const t: (content: TextContent) => WNode<Node>;

declare type SuspenseProps$1 = {
    fallback?: WNode<Node>;
};
declare const suspense: (props: SuspenseProps$1, child: Promise<WNode<Node>>) => WNode<Node>;

declare const runApp: (anchor: HTMLElement, app: WNode<Node>) => void;

/**
 * A strict definition for all custom jsx components to adhere to.
 */
declare type Component<Props extends Object, Children extends WNode<Node>[], ReturnNode extends WNode<Node>> = (props: Props, ...children: [...Children]) => ReturnNode;
declare const Fragment: unique symbol;
declare const jsx: (tag: string | Component<Object, WNode<Node>[], WNode<Node>> | Symbol, props: Object, ...children: WNode<Node>[]) => WNode<Node>;

declare type SupplyProps = {
    getChild: Producer<WNode<Node>>;
};
declare const Supply: Component<SupplyProps, [], WNode<Node>>;
declare type ForProps<T> = {
    items: Supplier<IndexedItem<T>[]>;
    render: Function$1<T, WNode<Node>>;
};
declare const For: <T extends Object>(props: ForProps<T>) => WNode<Node>;
declare type IfProps = {
    condition: boolean | IAtom<boolean>;
    true: Supplier<WNode<Node>>;
    false?: Supplier<WNode<Node>>;
};
declare const If: (props: IfProps) => WNode<Node>;
declare type SwitchProps<T> = {
    value: IAtom<T>;
    cases: [T, Supplier<WNode<Node>>][];
    default?: Supplier<WNode<Node>>;
};
declare const Switch: <T extends Object>(props: SwitchProps<T>) => WNode<Node>;
declare type SuspenseProps = {
    default?: WNode<Node>;
};
declare const Suspense: (props: SuspenseProps, ...children: Promise<WNode<Node>>[]) => WNode<Node>;

declare type TextNodeTypes = string | boolean | number;
declare type TextNodeSource = TextNodeTypes | Supplier<TextNodeTypes> | IAtom<TextNodeTypes>;
declare const $: (data: TextNodeSource) => WNode<Node>;

export { $, ChildrenOnlyElementBuilder, Component, Content, CreateStateSignature, DeriveStateSignature, ElementBuilder, EmptyElementBuilder, ExecutionScopeManager, FetchStateSignature, For, ForProps, Fragment, IAtom, ILeafAtom, ISideEffectRef, If, IfProps, IndexedItem, MaybeNode, MaybeNodeOrVNode, Properties, PropertiesAndChildrenElementBuilder, RawOrBinded, RunEffectSignature, Supply, SupplyProps, Suspense, SuspenseProps, Switch, SwitchProps, SymbolKey, SymbolTable, TextContent, TextNodeSource, TextNodeTypes, WElement, WNode, a, abbr, address, article, aside, b, base, bdi, bdo, blockquote, body, br, button, caption, captureContextState, cite, code, col, colgroup, createElement, createFragment, createState, createTextNode, data, datalist, dd, defer, del, deregisterDecorator, deriveState, derivedState, details, dfn, dialog, div, dl, dt, em, fetchState, fieldset, figcaption, figure, footer, forEach, form, frag, h1, h2, h3, h4, h5, h6, head, header, hr, html, i, ifElse, inject, input, ins, isAtom, isWNode, jsx, kbd, label, lazy, legend, li, link, main, mark, match, menu, meta, meter, mvar, nav, ol, onInitialMount, onMount, onUnmount, optgroup, option, output, p, pre, progress, provide, q, registerDecorator, rp, rt, ruby, runApp, runBatched, runEffect, runMountedEffect, runUntracked, s, samp, section, select, small, span, state, string, style, sub, summary, sup, suspense, t, table, tbody, td, textarea, tfoot, th, thead, time, title, tr, ul, wbr, withContext };
