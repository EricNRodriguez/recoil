import {Producer} from "../../../util";
import {WNode} from "../../../dom/src/core/node";
import {frag} from "../../index";
import {createComponent} from "../../../dom/src/component/api/component_factory";
import {IComponentContext} from "../../../dom/src/component/api/component_context";

export type SupplyProps = {
  get: Producer<WNode<Node>>;
};

export const supply = createComponent(
  (
    ctx: IComponentContext,
    props: SupplyProps,
  ): WNode<Node> => {
    const node = frag();

    ctx.runEffect((): void => {
      node.setChildren([props.get()]);
    });

    return node;
  }
);