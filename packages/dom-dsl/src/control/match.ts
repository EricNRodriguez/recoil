import { IAtom, runEffect } from "../../../atom";
import { WNode } from "../../../dom/src/node";
import { Function, WDerivationCache } from "../../../util";
import { createFragment } from "../../../dom/src/factory";

export type MatchProps<T> = {
  state: IAtom<T>;
  render: Function<T, WNode<Node>>;
};

export const match = <T extends Object>(props: MatchProps<T>): WNode<Node> => {
  let { state, render } = props;

  const anchor = createFragment([]);
  const matchCache: WDerivationCache<T, WNode<Node>> = new WDerivationCache(
    render
  );

  let prevState: T;
  const ref = runEffect((): void => {
    if (prevState === state.get()) {
      return;
    }

    prevState = state.get();
    const content = matchCache.get(prevState);
    anchor.setChildren([content]);
  });
  anchor.registerOnMountHook(() => ref.activate());
  anchor.registerOnUnmountHook(() => ref.deactivate());

  return anchor;
};
