import {WNode} from "../../../dom/src/node";
import {createComponent} from "../../../component/src/api";
import {IComponentContext} from "../../../component/src/context";
import {createFragment} from "../../../dom/src/factory";
import {notNullOrUndefined} from "../../../util";

export type SuspenseProps = {
  fallback?: WNode<Node>;
};

export const suspense = createComponent((ctx: IComponentContext, props: SuspenseProps, child: Promise<WNode<Node>>): WNode<Node> => {
  const anchor = createFragment([]);

  if (notNullOrUndefined(props.fallback)) {
    anchor.setChildren([props.fallback]);
  }

  child.then((c) => anchor.setChildren([c]));

  return anchor;
});
