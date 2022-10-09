import { Producer } from "shared";
import { frag } from "../element";
import { runRenderEffect } from "../binding/dom";
import {
  cleanup,
  registerOnMountHook,
  registerOnUnmountHook,
  setChildren,
} from "recoiljs-dom";

export type SupplyProps = {
  get: Producer<Node>;
};

export const supply = (props: SupplyProps): Node => {
  const node = frag();

  let content: Node | null = null;
  const ref = runRenderEffect((): void => {
    const prevContent = content;
    content = props.get();
    setChildren(node, [content]);
    if (prevContent !== null) {
      cleanup(prevContent);
    }
  });
  registerOnMountHook(node, () => ref.activate());
  registerOnUnmountHook(node, () => ref.deactivate());

  return node;
};
