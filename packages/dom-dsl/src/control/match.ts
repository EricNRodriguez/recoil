import { WNode } from "../../../dom";
import { IAtom } from "../../../atom";
import { frag } from "../element";
import { Function, WDerivationCache } from "../../../util";
import { createComponent, lazy } from "../../../component";
import { IComponentContext } from "../../../component";

export type MatchProps<T> = {
  state: IAtom<T>;
  render: Function<T, WNode<Node>>;
};

export const match = createComponent(
  <T extends Object>(
    ctx: IComponentContext,
    props: MatchProps<T>
  ): WNode<Node> => {
    let { state, render } = props;

    render = lazy(render);

    const anchor = frag();
    const matchCache: WDerivationCache<T, WNode<Node>> = new WDerivationCache(
      render
    );

    let prevState: T;
    ctx.runEffect((): void => {
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
