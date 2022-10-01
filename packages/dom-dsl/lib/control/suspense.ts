import { WNode, createFragment } from "recoiljs-dom";
import { notNullOrUndefined } from "shared";

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

  child.then((c) => {
    anchor.setChildren([c]);
    props.fallback?.cleanup();
  });

  return anchor;
};
