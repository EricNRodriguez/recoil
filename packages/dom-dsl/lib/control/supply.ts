import { Producer } from "shared";
import { WNode } from "recoiljs-dom";
import { frag } from "../element";
import { runEffect } from "recoiljs-atom";
import {runRenderEffect} from "../binding/dom";

export type SupplyProps = {
  get: Producer<WNode<Node>>;
};

export const supply = (props: SupplyProps): WNode<Node> => {
  const node = frag();

  const ref = runRenderEffect((): void => {
    node.setChildren([props.get()]);
  });
  node.registerOnMountHook(() => ref.activate());
  node.registerOnUnmountHook(() => ref.deactivate());

  return node;
};
