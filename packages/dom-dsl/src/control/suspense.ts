import {WNode} from "../../../dom/src/core/node";
import {createComponent} from "../../../dom/src/component/api/component_factory";
import {IComponentContext} from "../../../dom/src/component/api/component_context";
import {createFragment} from "../../../dom/src/core/factory";
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
