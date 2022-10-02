import { IAtom } from "recoiljs-atom";
import { WNode, createFragment } from "recoiljs-dom";
import { Function } from "shared";
import { runRenderEffect } from "../binding/dom";

export type MatchProps<T> = {
  state: IAtom<T>;
  render: Function<T, WNode<Node>>;
};

export const match = <T extends Object>(props: MatchProps<T>): WNode<Node> => {
  let { state, render } = props;

  const anchor = createFragment([]);
  let prevState: T;
  let content: WNode<Node> | null;
  const ref = runRenderEffect((): void => {
    if (prevState === state.get()) {
      return;
    }

    prevState = state.get();
    const prevContent = content;
    content = render(prevState);
    anchor.setChildren([content]);
    prevContent?.cleanup();
  });
  anchor.registerOnMountHook(() => ref.activate());
  anchor.registerOnUnmountHook(() => ref.deactivate());

  return anchor;
};
