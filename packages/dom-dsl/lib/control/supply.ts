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

  let content: WNode<Node> | null = null;
  const ref = runRenderEffect((): void => {
    const prevContent = content;
    content = props.get();
    node.setChildren([content]);
    prevContent?.cleanup();
  });
  node.registerOnMountHook(() => ref.activate());
  node.registerOnUnmountHook(() => ref.deactivate());

  return node;
};
