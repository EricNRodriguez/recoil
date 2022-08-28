import { WElement, WNode } from "../../dom";
import { IAtom } from "../../atom";
export declare type Content = WNode<Node> | string;
export declare type RawOrBinded = IAtom<any> | any;
export declare type Properties = {
    [key: string]: RawOrBinded;
};
export declare type ChildrenOnlyElementBuilder<K extends keyof HTMLElementTagNameMap> = (...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;
export declare type PropertiesAndChildrenElementBuilder<K extends keyof HTMLElementTagNameMap> = (properties: Properties, ...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;
export declare type EmptyElementBuilder<K extends keyof HTMLElementTagNameMap> = () => WElement<HTMLElementTagNameMap[K]>;
export declare type ElementBuilder<K extends keyof HTMLElementTagNameMap> = ChildrenOnlyElementBuilder<K> & PropertiesAndChildrenElementBuilder<K> & EmptyElementBuilder<K>;
export declare const html: ElementBuilder<"html">;
export declare const base: ElementBuilder<"base">;
export declare const head: ElementBuilder<"head">;
export declare const link: ElementBuilder<"link">;
export declare const meta: ElementBuilder<"meta">;
export declare const style: ElementBuilder<"style">;
export declare const title: ElementBuilder<"title">;
export declare const body: ElementBuilder<"body">;
export declare const address: ElementBuilder<"address">;
export declare const article: ElementBuilder<"article">;
export declare const aside: ElementBuilder<"aside">;
export declare const footer: ElementBuilder<"footer">;
export declare const header: ElementBuilder<"header">;
export declare const h1: ElementBuilder<"h1">;
export declare const h2: ElementBuilder<"h2">;
export declare const h3: ElementBuilder<"h3">;
export declare const h4: ElementBuilder<"h4">;
export declare const h5: ElementBuilder<"h5">;
export declare const h6: ElementBuilder<"h6">;
export declare const main: ElementBuilder<"main">;
export declare const nav: ElementBuilder<"nav">;
export declare const section: ElementBuilder<"section">;
export declare const blockquote: ElementBuilder<"blockquote">;
export declare const dd: ElementBuilder<"dd">;
export declare const div: ElementBuilder<"div">;
export declare const dl: ElementBuilder<"dl">;
export declare const dt: ElementBuilder<"dt">;
export declare const figcaption: ElementBuilder<"figcaption">;
export declare const figure: ElementBuilder<"figure">;
export declare const hr: ElementBuilder<"hr">;
export declare const li: ElementBuilder<"li">;
export declare const menu: ElementBuilder<"menu">;
export declare const ol: ElementBuilder<"ol">;
export declare const p: ElementBuilder<"p">;
export declare const pre: ElementBuilder<"pre">;
export declare const ul: ElementBuilder<"ul">;
export declare const a: ElementBuilder<"a">;
export declare const abbr: ElementBuilder<"abbr">;
export declare const b: ElementBuilder<"b">;
export declare const bdi: ElementBuilder<"bdi">;
export declare const bdo: ElementBuilder<"bdo">;
export declare const br: ElementBuilder<"br">;
export declare const cite: ElementBuilder<"cite">;
export declare const code: ElementBuilder<"code">;
export declare const data: ElementBuilder<"data">;
export declare const dfn: ElementBuilder<"dfn">;
export declare const em: ElementBuilder<"em">;
export declare const i: ElementBuilder<"i">;
export declare const kbd: ElementBuilder<"kbd">;
export declare const mark: ElementBuilder<"mark">;
export declare const q: ElementBuilder<"q">;
export declare const rp: ElementBuilder<"rp">;
export declare const rt: ElementBuilder<"rt">;
export declare const ruby: ElementBuilder<"ruby">;
export declare const s: ElementBuilder<"s">;
export declare const samp: ElementBuilder<"samp">;
export declare const small: ElementBuilder<"small">;
export declare const span: ElementBuilder<"span">;
export declare const string: ElementBuilder<"strong">;
export declare const sub: ElementBuilder<"sub">;
export declare const sup: ElementBuilder<"sup">;
export declare const time: ElementBuilder<"time">;
export declare const mvar: ElementBuilder<"var">;
export declare const wbr: ElementBuilder<"wbr">;
export declare const del: ElementBuilder<"del">;
export declare const ins: ElementBuilder<"ins">;
export declare const caption: ElementBuilder<"caption">;
export declare const col: ElementBuilder<"col">;
export declare const colgroup: ElementBuilder<"colgroup">;
export declare const table: ElementBuilder<"table">;
export declare const tbody: ElementBuilder<"tbody">;
export declare const td: ElementBuilder<"td">;
export declare const tfoot: ElementBuilder<"tfoot">;
export declare const th: ElementBuilder<"th">;
export declare const thead: ElementBuilder<"thead">;
export declare const tr: ElementBuilder<"tr">;
export declare const button: ElementBuilder<"button">;
export declare const datalist: ElementBuilder<"datalist">;
export declare const fieldset: ElementBuilder<"fieldset">;
export declare const form: ElementBuilder<"form">;
export declare const input: ElementBuilder<"input">;
export declare const label: ElementBuilder<"label">;
export declare const legend: ElementBuilder<"legend">;
export declare const meter: ElementBuilder<"meter">;
export declare const optgroup: ElementBuilder<"optgroup">;
export declare const option: ElementBuilder<"option">;
export declare const output: ElementBuilder<"output">;
export declare const progress: ElementBuilder<"progress">;
export declare const select: ElementBuilder<"select">;
export declare const textarea: ElementBuilder<"textarea">;
export declare const details: ElementBuilder<"details">;
export declare const dialog: ElementBuilder<"dialog">;
export declare const summary: ElementBuilder<"summary">;
export declare const frag: (...children: WNode<Node>[]) => WNode<Node>;
export declare type MaybeNode = Node | undefined | null;
export declare type MaybeNodeOrVNode = MaybeNode | WNode<Node>;
export declare type TextContent = string | IAtom<string>;
export declare const t: (content: TextContent) => WNode<Node>;
