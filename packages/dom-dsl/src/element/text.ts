import { Supplier } from "../../../util";
import { IAtom, isAtom } from "../../../atom";
import { VNode } from "../../../vdom";
import {createComponent, IComponentContext} from "../../../dom-component";

export type TextContent = string | Supplier<string> | IAtom<string>;

export const t = (content: TextContent): VNode<Node> => {
  let textNode: VNode<Node>;
  if (typeof content === "string") {
    textNode = new VNode(document.createTextNode(content));
  } else if (isAtom(content) || typeof content === "function") {
    textNode = createBindedTextNode(content);
  } else {
    // TODO(ericr): be more specific with a fall through
    throw new Error();
  }

  return textNode;
};

type BindedTextNodeSource = Supplier<string> | IAtom<string>;

const createBindedTextNode = createComponent((
  ctx: IComponentContext,
  source: BindedTextNodeSource,
): VNode<Node> => {
    const vNode: VNode<Node> = new VNode(document.createTextNode(""));

    if (isAtom(source)) {
      ctx.runEffect((): void => {
        vNode.getRaw().textContent = (source as IAtom<string>).get();
      });
    } else if (typeof source === "function") {
      ctx.runEffect((): void => {
        vNode.getRaw().textContent = source();
      });
    } else {
      // TODO(ericr): be more specific with a fall through
      throw new Error();
    }

    return vNode;
  }
);
