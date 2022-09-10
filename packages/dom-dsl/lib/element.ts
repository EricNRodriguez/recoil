import {
  createElement,
  createFragment,
  createTextNode,
  isWNode,
  WElement,
  WNode,
} from "recoiljs-dom";
import { IAtom } from "recoiljs-atom";
import { wrapTextInWNode } from "recoiljs-dom/lib/util";
import { nullOrUndefined } from "shared";
import {bindProps} from "./binding/dom";
import {Children, Props} from "recoiljs-dom";

export type Content = WNode<Node> | string;
export type RawOrBinded = IAtom<any> | any;
export type Properties = { [key: string]: RawOrBinded };

export const createBindedElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K | HTMLElementTagNameMap[K],
  props: Props,
  children: Children
): WElement<HTMLElementTagNameMap[K]> => {
  const element = createElement(tag, {}, children);
  bindProps(element, props);
  return element;
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
const createDslElementBuilder = <K extends keyof HTMLElementTagNameMap>(
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
export const html = createDslElementBuilder("html");

// document metadata
export const base = createDslElementBuilder("base");
export const head = createDslElementBuilder("head");
export const link = createDslElementBuilder("link");
export const meta = createDslElementBuilder("meta");
export const style = createDslElementBuilder("style");
export const title = createDslElementBuilder("title");

// content sectioning
export const body = createDslElementBuilder("body");
export const address = createDslElementBuilder("address");
export const article = createDslElementBuilder("article");
export const aside = createDslElementBuilder("aside");
export const footer = createDslElementBuilder("footer");
export const header = createDslElementBuilder("header");
export const h1 = createDslElementBuilder("h1");
export const h2 = createDslElementBuilder("h2");
export const h3 = createDslElementBuilder("h3");
export const h4 = createDslElementBuilder("h4");
export const h5 = createDslElementBuilder("h5");
export const h6 = createDslElementBuilder("h6");
export const main = createDslElementBuilder("main");
export const nav = createDslElementBuilder("nav");
export const section = createDslElementBuilder("section");

// text content
export const blockquote = createDslElementBuilder("blockquote");
export const dd = createDslElementBuilder("dd");
export const div = createDslElementBuilder("div");
export const dl = createDslElementBuilder("dl");
export const dt = createDslElementBuilder("dt");
export const figcaption = createDslElementBuilder("figcaption");
export const figure = createDslElementBuilder("figure");
export const hr = createDslElementBuilder("hr");
export const li = createDslElementBuilder("li");
export const menu = createDslElementBuilder("menu");
export const ol = createDslElementBuilder("ol");
export const p = createDslElementBuilder("p");
export const pre = createDslElementBuilder("pre");
export const ul = createDslElementBuilder("ul");

// inline text semantics
export const a = createDslElementBuilder("a");
export const abbr = createDslElementBuilder("abbr");
export const b = createDslElementBuilder("b");
export const bdi = createDslElementBuilder("bdi");
export const bdo = createDslElementBuilder("bdo");
export const br = createDslElementBuilder("br");
export const cite = createDslElementBuilder("cite");
export const code = createDslElementBuilder("code");
export const data = createDslElementBuilder("data");
export const dfn = createDslElementBuilder("dfn");
export const em = createDslElementBuilder("em");
export const i = createDslElementBuilder("i");
export const kbd = createDslElementBuilder("kbd");
export const mark = createDslElementBuilder("mark");
export const q = createDslElementBuilder("q");
export const rp = createDslElementBuilder("rp");
export const rt = createDslElementBuilder("rt");
export const ruby = createDslElementBuilder("ruby");
export const s = createDslElementBuilder("s");
export const samp = createDslElementBuilder("samp");
export const small = createDslElementBuilder("small");
export const span = createDslElementBuilder("span");
export const string = createDslElementBuilder("strong");
export const sub = createDslElementBuilder("sub");
export const sup = createDslElementBuilder("sup");
export const time = createDslElementBuilder("time");
export const mvar = createDslElementBuilder("var");
export const wbr = createDslElementBuilder("wbr");

// demarcating edits
export const del = createDslElementBuilder("del");
export const ins = createDslElementBuilder("ins");

// table content
export const caption = createDslElementBuilder("caption");
export const col = createDslElementBuilder("col");
export const colgroup = createDslElementBuilder("colgroup");
export const table = createDslElementBuilder("table");
export const tbody = createDslElementBuilder("tbody");
export const td = createDslElementBuilder("td");
export const tfoot = createDslElementBuilder("tfoot");
export const th = createDslElementBuilder("th");
export const thead = createDslElementBuilder("thead");
export const tr = createDslElementBuilder("tr");

// forms
export const button = createDslElementBuilder("button");
export const datalist = createDslElementBuilder("datalist");
export const fieldset = createDslElementBuilder("fieldset");
export const form = createDslElementBuilder("form");
export const input = createDslElementBuilder("input");
export const label = createDslElementBuilder("label");
export const legend = createDslElementBuilder("legend");
export const meter = createDslElementBuilder("meter");
export const optgroup = createDslElementBuilder("optgroup");
export const option = createDslElementBuilder("option");
export const output = createDslElementBuilder("output");
export const progress = createDslElementBuilder("progress");
export const select = createDslElementBuilder("select");
export const textarea = createDslElementBuilder("textarea");

// interactive
export const details = createDslElementBuilder("details");
export const dialog = createDslElementBuilder("dialog");
export const summary = createDslElementBuilder("summary");

export const frag = (...children: WNode<Node>[]): WNode<Node> =>
  createFragment(children);

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | WNode<Node>;

export type TextContent = string | IAtom<string>;
export const t = (content: TextContent): WNode<Node> => {
  const node = createTextNode("");
  bindProps(node, {textContent: content});
  return node;
}
