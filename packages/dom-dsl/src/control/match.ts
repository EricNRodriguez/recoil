import {IAtom} from "../../../atom";
import {WNode} from "../../../dom/src/node";
import {Function, WDerivationCache} from "../../../util";
import {createComponent} from "../../../component/src/api";
import {IComponentContext} from "../../../component/src/context";
import {createFragment} from "../../../dom/src/factory";

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

    const anchor = createFragment([]);
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
