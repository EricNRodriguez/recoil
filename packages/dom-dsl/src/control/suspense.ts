import { frag } from "../..";
import { createComponent, IComponentContext } from "../../../dom-component";
import { WNode } from "../../../dom/src/node";
import { notNullOrUndefined } from "../../../util";

export type SupsenseOptionalArgs = {
  fallback: WNode<Node>;
};

export const suspense = createComponent(
  (
    ctx: IComponentContext,
    child: Promise<WNode<Node>>,
    fallback: WNode<Node> | undefined = undefined
  ): WNode<Node> => {
    const anchor = frag();

    if (notNullOrUndefined(fallback)) {
      anchor.setChildren(fallback);
    }

    child.then((value: WNode<Node>): void => {
      anchor.setChildren(value);
    });

    return anchor;
  }
);
