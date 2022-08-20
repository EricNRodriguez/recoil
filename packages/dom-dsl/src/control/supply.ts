import {Producer} from "../../../util";
import {WNode} from "../../../dom";
import {frag} from "../element";
import {createComponent} from "../../../dom";
import {IComponentContext} from "../../../dom";

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