import { WNode, createFragment } from "../../../dom";
import { notNullOrUndefined } from "../../../util";

export type SuspenseProps = {
  fallback?: WNode<Node>;
};

export const suspense = (
  props: SuspenseProps,
  child: Promise<WNode<Node>>
): WNode<Node> => {
  const anchor = createFragment([]);

  if (notNullOrUndefined(props.fallback)) {
    anchor.setChildren([props.fallback]);
  }

  child.then((c) => anchor.setChildren([c]));

  return anchor;
};
