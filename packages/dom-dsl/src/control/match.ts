import {IAtom} from "../../../atom";
import {WNode} from "../../../dom/src/core/node";
import {Function, WDerivationCache} from "../../../util";
import {createComponent, lazy} from "../../../dom/src/component/api/component_factory";
import {IComponentContext} from "../../../dom/src/component/api/component_context";
import {createFragment} from "../../../dom/src/core/factory";

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
