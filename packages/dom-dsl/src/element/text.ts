import { Supplier } from "../../../util";
import { IAtom, isAtom } from "../../../atom";
import { WNode } from "../../../dom";
import { createComponent, IComponentContext } from "../../../dom-component";

export type TextContent = string | Supplier<string> | IAtom<string>;

export const t = (content: TextContent): WNode<Node> => {
  let textNode: WNode<Node>;
  if (typeof content === "string") {
    textNode = new WNode(document.createTextNode(content));
  } else if (isAtom(content) || typeof content === "function") {
    textNode = createBindedTextNode(content);
  } else {
    // TODO(ericr): be more specific with a fall through
    throw new Error();
  }

  return textNode;
};

type BindedTextNodeSource = Supplier<string> | IAtom<string>;

const createBindedTextNode = createComponent(
  (ctx: IComponentContext, source: BindedTextNodeSource): WNode<Node> => {
    const wNode: WNode<Node> = new WNode(document.createTextNode(""));

    if (isAtom(source)) {
      ctx.runEffect((): void => {
        wNode.unwrap().textContent = (source as IAtom<string>).get();
      });
    } else if (typeof source === "function") {
      ctx.runEffect((): void => {
        wNode.unwrap().textContent = source();
      });
    } else {
      // TODO(ericr): be more specific with a fall through
      throw new Error();
    }

    return wNode;
  }
);
