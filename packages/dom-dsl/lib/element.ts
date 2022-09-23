import {
  createElement,
  createFragment,
  createTextNode,
  isWNode,
  WElement,
  WNode,
} from "recoiljs-dom";
import { deriveState, IAtom, isAtom } from "recoiljs-atom";
import { wrapTextInWNode } from "recoiljs-dom/lib/util";
import { nullOrUndefined, Supplier } from "shared";
import { bindProps } from "./binding/dom";
import { Children, Props } from "recoiljs-dom";

export type Content = WNode<Node> | string;
export type RawOrBinded = IAtom<any> | any;
export type Properties = { [key: string]: RawOrBinded };

export const createBindedElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K | HTMLElementTagNameMap[K],
  props: Props,
  children: Children
): WElement<HTMLElementTagNameMap[K]> => {
  const element = createElement(tag as any, {}, children);
  bindProps(element, props);
  return element;
};

export type TextNodeTypes = string | boolean | number;
export const createBindedText = (
  content: TextNodeTypes | IAtom<TextNodeTypes>
) => {
  const node = createTextNode("");
  bindProps(node, { textContent: content });
  return node;
};

// prettier-ignore
export type ChildrenOnlyElementBuilder<K extends keyof HTMLElementTagNameMap> =
  (...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;

// prettier-ignore
export type PropertiesAndChildrenElementBuilder<K extends keyof HTMLElementTagNameMap> =
  (properties: Properties, ...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;

// prettier-ignore
export type EmptyElementBuilder<K extends keyof HTMLElementTagNameMap> =
  () => WElement<HTMLElementTagNameMap[K]>;

export type ElementBuilder<K extends keyof HTMLElementTagNameMap> =
  ChildrenOnlyElementBuilder<K> &
    PropertiesAndChildrenElementBuilder<K> &
    EmptyElementBuilder<K>;

// prettier-ignore
const createDslElementHelper = <K extends keyof HTMLElementTagNameMap>(
  tag: K
): ElementBuilder<K> => {
  return (
    firstArg?: Content | Properties,
    ...remainingChildren: Content[]
  ): WElement<HTMLElementTagNameMap[K]> => {
    const adaptedFirstArg = wrapTextInWNode(firstArg);
    const adaptedRemainingChildren = remainingChildren.map(wrapTextInWNode) as WNode<Node>[];

    if (nullOrUndefined(adaptedFirstArg)) {
      return createBindedElement(
        tag,
        {},
        [],
      );
    } else if (isWNode(adaptedFirstArg)) {
      return createBindedElement(
        tag,
        {},
        [adaptedFirstArg as WNode<any>, ...adaptedRemainingChildren],
      );
    } else {
      const element = createBindedElement(
        tag,
        adaptedFirstArg as Properties,
        adaptedRemainingChildren
      );
      return element;
    }
  };
};

// main root
export const html = createDslElementHelper("html");

// document metadata
export const base = createDslElementHelper("base");
export const head = createDslElementHelper("head");
export const link = createDslElementHelper("link");
export const meta = createDslElementHelper("meta");
export const style = createDslElementHelper("style");
export const title = createDslElementHelper("title");

// content sectioning
export const body = createDslElementHelper("body");
export const address = createDslElementHelper("address");
export const article = createDslElementHelper("article");
export const aside = createDslElementHelper("aside");
export const footer = createDslElementHelper("footer");
export const header = createDslElementHelper("header");
export const h1 = createDslElementHelper("h1");
export const h2 = createDslElementHelper("h2");
export const h3 = createDslElementHelper("h3");
export const h4 = createDslElementHelper("h4");
export const h5 = createDslElementHelper("h5");
export const h6 = createDslElementHelper("h6");
export const main = createDslElementHelper("main");
export const nav = createDslElementHelper("nav");
export const section = createDslElementHelper("section");

// text content
export const blockquote = createDslElementHelper("blockquote");
export const dd = createDslElementHelper("dd");
export const div = createDslElementHelper("div");
export const dl = createDslElementHelper("dl");
export const dt = createDslElementHelper("dt");
export const figcaption = createDslElementHelper("figcaption");
export const figure = createDslElementHelper("figure");
export const hr = createDslElementHelper("hr");
export const li = createDslElementHelper("li");
export const menu = createDslElementHelper("menu");
export const ol = createDslElementHelper("ol");
export const p = createDslElementHelper("p");
export const pre = createDslElementHelper("pre");
export const ul = createDslElementHelper("ul");

// inline text semantics
export const a = createDslElementHelper("a");
export const abbr = createDslElementHelper("abbr");
export const b = createDslElementHelper("b");
export const bdi = createDslElementHelper("bdi");
export const bdo = createDslElementHelper("bdo");
export const br = createDslElementHelper("br");
export const cite = createDslElementHelper("cite");
export const code = createDslElementHelper("code");
export const data = createDslElementHelper("data");
export const dfn = createDslElementHelper("dfn");
export const em = createDslElementHelper("em");
export const i = createDslElementHelper("i");
export const kbd = createDslElementHelper("kbd");
export const mark = createDslElementHelper("mark");
export const q = createDslElementHelper("q");
export const rp = createDslElementHelper("rp");
export const rt = createDslElementHelper("rt");
export const ruby = createDslElementHelper("ruby");
export const s = createDslElementHelper("s");
export const samp = createDslElementHelper("samp");
export const small = createDslElementHelper("small");
export const span = createDslElementHelper("span");
export const string = createDslElementHelper("strong");
export const sub = createDslElementHelper("sub");
export const sup = createDslElementHelper("sup");
export const time = createDslElementHelper("time");
export const mvar = createDslElementHelper("var");
export const wbr = createDslElementHelper("wbr");

// demarcating edits
export const del = createDslElementHelper("del");
export const ins = createDslElementHelper("ins");

// table content
export const caption = createDslElementHelper("caption");
export const col = createDslElementHelper("col");
export const colgroup = createDslElementHelper("colgroup");
export const table = createDslElementHelper("table");
export const tbody = createDslElementHelper("tbody");
export const td = createDslElementHelper("td");
export const tfoot = createDslElementHelper("tfoot");
export const th = createDslElementHelper("th");
export const thead = createDslElementHelper("thead");
export const tr = createDslElementHelper("tr");

// forms
export const button = createDslElementHelper("button");
export const datalist = createDslElementHelper("datalist");
export const fieldset = createDslElementHelper("fieldset");
export const form = createDslElementHelper("form");
export const input = createDslElementHelper("input");
export const label = createDslElementHelper("label");
export const legend = createDslElementHelper("legend");
export const meter = createDslElementHelper("meter");
export const optgroup = createDslElementHelper("optgroup");
export const option = createDslElementHelper("option");
export const output = createDslElementHelper("output");
export const progress = createDslElementHelper("progress");
export const select = createDslElementHelper("select");
export const textarea = createDslElementHelper("textarea");

// interactive
export const details = createDslElementHelper("details");
export const dialog = createDslElementHelper("dialog");
export const summary = createDslElementHelper("summary");

// media
export const audio = createDslElementHelper("audio");
export const img = createDslElementHelper("img");


export const frag = (...children: WNode<Node>[]): WNode<Node> =>
  createFragment(children);

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | WNode<Node>;

export type TextNodeSource =
  | TextNodeTypes
  | Supplier<TextNodeTypes>
  | IAtom<TextNodeTypes>;

export const t = (data: TextNodeSource): WNode<Node> => {
  if (isAtom(data)) {
    return createBindedText(
      (data as IAtom<TextNodeTypes>).map((v: TextNodeTypes) => v.toString())
    );
  } else if (typeof data === "function") {
    return createBindedText(
      deriveState(() => (data as Supplier<TextNodeTypes>)().toString())
    );
  } else {
    return createBindedText(data.toString());
  }
};
