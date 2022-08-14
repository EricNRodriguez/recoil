import { createComponent, IComponentContext } from "../../index";
import { WNode } from "../../../dom";
import { IAtom } from "../../../atom";
import { frag } from "../element";
import { Function, WDerivationCache } from "../../../util";
import {lazy} from "../component/component_factory";

export const match = createComponent(
  <T extends Object>(
    ctx: IComponentContext,
    state: IAtom<T>,
    render: Function<T, WNode<Node>>
  ): WNode<Node> => {
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
