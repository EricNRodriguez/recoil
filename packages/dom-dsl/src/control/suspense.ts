import {frag, IComponentContext} from "../../index";
import { WNode } from "../../../dom";
import { notNullOrUndefined } from "../../../util";
import {createComponent} from "../../../component";

export type SuspenseOptionalArgs = {
  fallback: WNode<Node>;
};

export type SuspenseProps = {
  child: Promise<WNode<Node>>;
  fallback?: WNode<Node>;
};

export const suspense = createComponent(
  (
    ctx: IComponentContext,
    props: SuspenseProps
  ): WNode<Node> => {
    const anchor = frag();

    if (notNullOrUndefined(props.fallback)) {
      anchor.setChildren([props.fallback]);
    }

    props.child.then((value: WNode<Node>): void => {
      anchor.setChildren([value]);
    });

    return anchor;
  }
);
