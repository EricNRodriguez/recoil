import { Producer } from "../../../util";
import { WNode } from "../../../dom/src/node";
import { frag } from "../../index";
import { runEffect } from "../../../atom";

export type SupplyProps = {
  get: Producer<WNode<Node>>;
};

export const supply = (props: SupplyProps): WNode<Node> => {
  const node = frag();

  const ref = runEffect((): void => {
    node.setChildren([props.get()]);
  });
  node.registerOnMountHook(() => ref.activate());
  node.registerOnUnmountHook(() => ref.deactivate());

  return node;
};
