import {cleanup, createFragment, setChildren} from "recoiljs-dom";

export type SuspenseProps = {
  fallback?: Node;
};

export const suspense = (
  props: SuspenseProps,
  child: Promise<Node>
): Node => {
  const anchor = createFragment([]);

  if (props.fallback != null) {
    setChildren(anchor, [props.fallback]);
  }

  child.then((c) => {
    setChildren(anchor, [c]);
    if (props.fallback != null) {
      cleanup(props.fallback);
    }
  });

  return anchor;
};
