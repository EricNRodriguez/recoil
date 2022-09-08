import { Producer } from "shared"
import { WNode } from "dom";
import { frag } from "../element";
import { runEffect } from "recoiljs-atom";

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
