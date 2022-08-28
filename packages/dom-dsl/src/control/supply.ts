import { Producer } from "utils";
import { WNode } from "dom";
import { frag } from "../element";
import { runEffect } from "atom";

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
