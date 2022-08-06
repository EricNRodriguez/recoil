import { frag } from "../../index";
import { createComponent, IComponentContext } from "../../index";
import { WNode } from "../../../dom";
import { notNullOrUndefined } from "../../../util";

export type SuspenseOptionalArgs = {
  fallback: WNode<Node>;
};

export type SuspenseSignature = (
  child: Promise<WNode<Node>>,
  { fallback }: SuspenseOptionalArgs
) => WNode<Node>;
export const suspense: SuspenseSignature = createComponent(
  (
    ctx: IComponentContext,
    child: Promise<WNode<Node>>,
    { fallback }: SuspenseOptionalArgs
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
