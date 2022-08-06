import { createElement, createFragment, WElement, WNode } from "../../dom";
import { wrapTextInVNode } from "./util/dom_util";
import { IAtom, ILeafAtom } from "../../atom";
import { createComponent, IComponentContext } from "../index";
import {clamp, Consumer, notNullOrUndefined, Supplier} from "../../util";

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
    onInput: Consumer<string>,
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

export const a = (content: AnchorContent): WElement<HTMLAnchorElement> => {
  return createElement("a", {}, [t(content)]);
};

export const br = (): WElement<HTMLBRElement> => {
  return createElement("br", {}, []);
};

export type DivContent = WNode<Node> | string;

export const div = (...children: DivContent[]): WElement<HTMLElement> => {
  return createElement("div", {}, children.map(wrapTextInVNode));
};

export const frag = (...children: WNode<Node>[]): WNode<Node> => {
  return createFragment(children);
};

export const head = (...content: WNode<Node>[]): WElement<HTMLHeadElement> => {
  return createElement("head", {}, content);
};

export type HeaderContent = WNode<Node> | string;

interface HeaderBuilder {
  (content: HeaderContent): WElement<HTMLHeadingElement>;
}

const buildHeaderDslHelper = (headerNumber: string): HeaderBuilder => {
  return (content: HeaderContent): WElement<HTMLHeadingElement> => {
    return createElement(
      `h${headerNumber}` as keyof HTMLElementTagNameMap,
      {},
      [wrapTextInVNode(content)]
    ) as WElement<HTMLHeadingElement>;
  };
};

export const h1 = buildHeaderDslHelper("1");
export const h2 = buildHeaderDslHelper("2");
export const h3 = buildHeaderDslHelper("3");
export const h4 = buildHeaderDslHelper("4");
export const h5 = buildHeaderDslHelper("5");
export const h6 = buildHeaderDslHelper("6");

export const hr = (): WElement<HTMLHRElement> => {
  return createElement("hr", {}, []);
};
// key value pair used for efficient indexing of existing built elements
export type IndexedItem<T> = [string, T];

// utility lenses for unboxing index and item from an IndexedItem
export const getKey = <T>(item: IndexedItem<T>): string => item[0];
export const getItem = <T>(item: IndexedItem<T>): T => item[1];

export const link = (): WElement<HTMLLinkElement> => {
  return createElement("link", {}, []);
};

export type MaybeNode = Node | undefined | null;
export type MaybeNodeOrVNode = MaybeNode | WNode<Node>;

type ParagraphContent = WNode<Text> | string;

export const p = (
  children: ParagraphContent
): WElement<HTMLParagraphElement> => {
  return createElement("p", {}, [wrapTextInVNode(children)]);
};

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
