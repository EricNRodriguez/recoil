import {createElement, createFragment, isWNode, WElement, WNode} from "../../dom";
import { wrapTextInVNode } from "./util/dom_util";
import { IAtom } from "../../atom";
import { createComponent, IComponentContext } from "../index";
import {
  clamp,
  Consumer,
  notNullOrUndefined,
  nullOrUndefined,
  Supplier,
} from "../../util";

export type Content = WNode<Node> | string;
export type RawOrBindedText = IAtom<string> | Supplier<string> | string;
export type Attributes = { [key: string]: RawOrBindedText };

// prettier-ignore
export type AttributesOnlyElementBuilder<K extends keyof HTMLElementTagNameMap> =
  (attributes: Attributes) => WElement<HTMLElementTagNameMap[K]>;

// prettier-ignore
export type ChildrenOnlyElementBuilder<K extends keyof HTMLElementTagNameMap> =
  (...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;

// prettier-ignore
export type AttributeAndChildrenElementBuilder<K extends keyof HTMLElementTagNameMap> =
  (attributes: Attributes, ...children: Content[]) => WElement<HTMLElementTagNameMap[K]>;

// prettier-ignore
export type EmptyElementBuilder<K extends keyof HTMLElementTagNameMap> =
  () => WElement<HTMLElementTagNameMap[K]>;

export type ElementBuilder<K extends keyof HTMLElementTagNameMap> =
  AttributesOnlyElementBuilder<K> &
    ChildrenOnlyElementBuilder<K> &
    AttributeAndChildrenElementBuilder<K> &
    EmptyElementBuilder<K>;

// prettier-ignore
const createDslElementBuilder = <K extends keyof HTMLElementTagNameMap>(
  tag: K
): ElementBuilder<K> => {
  return (
    firstArg?: Content | Attributes,
    ...remainingChildren: Content[]
  ): WElement<HTMLElementTagNameMap[K]> => {
    const adaptedFirstArg = wrapTextInVNode(firstArg);
    const adaptedRemainingChildren = remainingChildren.map(wrapTextInVNode);

    if (nullOrUndefined(adaptedFirstArg)) {
      return createElement(
        tag,
        {},
        [],
      );
    } else if (isWNode(adaptedFirstArg)) {
      return createElement(
        tag,
        {},
        [adaptedFirstArg as WNode<any>, ...adaptedRemainingChildren],
      );
    } else {
      return createElement(
        tag,
        adaptedFirstArg as Attributes,
        adaptedRemainingChildren
      );
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


// TODO: adapt everything below

export type ButtonContent = WNode<Text> | string;

export const button = (content: ButtonContent): WElement<HTMLButtonElement> => {
  return createElement(
    "button",
    {
      type: "button",
    },
    [wrapTextInVNode(content)]
  );
};

export type CheckboxArguments = {
  isChecked: IAtom<boolean | null>;
  isEnabled?: IAtom<boolean>;
};

export const checkbox = createComponent(
  (
    ctx: IComponentContext,
    args: CheckboxArguments
  ): WElement<HTMLInputElement> => {
    return createElement(
      "input",
      {
        type: "checkbox",
        checked: () => args.isChecked.get() === true,
        indeterminate: () => args.isChecked.get() === null,
        disabled: (() =>
          notNullOrUndefined(args.isEnabled)
            ? () => !args.isEnabled!.get()
            : () => false)(),
      },
      []
    );
  }
);

export enum FormTarget {
  BLANK = "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "_top",
}

export const form = (...content: WNode<Node>[]): WElement<HTMLFormElement> => {
  return createElement("form", {}, content);
};

export const input = (): WElement<HTMLInputElement> => {
  return createElement("input", {}, []);
};

export type LabelContent = TextContent;

export const label = (content: LabelContent): WElement<HTMLLabelElement> => {
  return createElement("label", {}, [t(content)]);
};

export type NumberInputArgs = {
  max?: number;
  min?: number;
  num: IAtom<number>;
  onInput: Consumer<number>;
};

export const numberInput = createComponent(
  (
    ctx: IComponentContext,
    args: NumberInputArgs
  ): WElement<HTMLInputElement> => {
    const inputElement = createElement(
      "input",
      {
        ...(notNullOrUndefined(args.max) ? { max: args.max } : {}),
        ...(notNullOrUndefined(args.min) ? { min: args.min } : {}),
        type: "number",
        value: () =>
          clamp({
            max: args.max,
            min: args.min,
            val: args.num.get(),
          }).toString(),
      },
      []
    );

    const onInput = (): void => {
      const rawValue: number = inputElement.unwrap().valueAsNumber;

      if (Number.isNaN(rawValue)) {
        return;
      }

      const clampedValue: number = clamp({
        max: args.max,
        min: args.min,
        val: rawValue,
      });

      if (rawValue !== clampedValue) {
        inputElement.unwrap().valueAsNumber = clampedValue;
      }

      args.onInput(clampedValue);
    };
    inputElement.setEventHandler("click", onInput);

    return inputElement;
  }
);

export type RadioButtonArguments = {
  isChecked: IAtom<boolean>;
};

export const radioButton = createComponent(
  (
    ctx: IComponentContext,
    args: RadioButtonArguments
  ): WElement<HTMLInputElement> => {
    return createElement(
      "input",
      {
        type: "radio",
        checked: args.isChecked,
      },
      []
    );
  }
);

export const textInput = createComponent(
  (
    ctx: IComponentContext,
    text: IAtom<string>,
    onInput: Consumer<string>
  ): WElement<HTMLInputElement> => {
    const elem: WElement<HTMLInputElement> = createElement(
      "input",
      {
        type: "text",
        value: text,
      },
      []
    ).setEventHandler("input", () => onInput(elem.unwrap().value));

    return elem;
  }
);

export type AnchorContent = TextContent;

export const frag = (...children: WNode<Node>[]): WNode<Node> => {
  return createFragment(children);
};

// key value pair used for efficient indexing of existing built elements
export type IndexedItem<T> = [string, T];

// utility lenses for unboxing index and item from an IndexedItem
export const getKey = <T>(item: IndexedItem<T>): string => item[0];
export const getItem = <T>(item: IndexedItem<T>): T => item[1];

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | WNode<Node>;

type ParagraphContent = WNode<Text> | string;


export type TextContent = string | Supplier<string> | IAtom<string>;

export const t = (content: TextContent): WNode<Node> => {
  const node = new WNode<Node>(document.createTextNode(""));

  if (typeof content === "string") {
    node.setProperty("textContent", content);
  } else {
    node.bindProperty("textContent", content);
  }

  return node;
};