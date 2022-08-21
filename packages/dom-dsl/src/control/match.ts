import { IAtom } from "../../../atom";
import { WNode } from "../../../dom/src/node";
import { Function, WDerivationCache } from "../../../util";
import {closeOverComponentState, createComponent, runMountedEffect} from "../../../component/src/api";
import { createFragment } from "../../../dom/src/factory";

export type MatchProps<T> = {
  state: IAtom<T>;
  render: Function<T, WNode<Node>>;
};

export const match = createComponent(
  <T extends Object>(
    props: MatchProps<T>
  ): WNode<Node> => {
    let { state, render } = props;

    render = closeOverComponentState(render);

    const anchor = createFragment([]);
    const matchCache: WDerivationCache<T, WNode<Node>> = new WDerivationCache(
      render
    );

    let prevState: T;
    runMountedEffect((): void => {
      if (prevState === state.get()) {
        return;
      }

      prevState = state.get();
      const content = matchCache.get(prevState);
      anchor.setChildren([content]);
    });

    return anchor;
  }
);
