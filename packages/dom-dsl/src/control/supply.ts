import { Producer } from "../../../util";
import { WNode } from "../../../dom/src/node";
import { frag } from "../../index";
import {createComponent, runMountedEffect} from "../../../component/src/api";

export type SupplyProps = {
  get: Producer<WNode<Node>>;
};

export const supply = createComponent(
  (props: SupplyProps): WNode<Node> => {
    const node = frag();

    runMountedEffect((): void => {
      node.setChildren([props.get()]);
    });

    return node;
  }
);
