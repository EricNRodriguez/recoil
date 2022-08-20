import {Producer} from "../../../util";
import {WNode} from "../../../dom/src/node";
import {frag} from "../../index";
import {createComponent} from "../../../component/src/api";
import {IComponentContext} from "../../../component/src/context";

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