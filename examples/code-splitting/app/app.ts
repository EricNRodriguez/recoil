import {div, suspense} from "recoiljs-dom-dsl";
import {WNode} from "recoiljs-dom";
import {lazy} from "recoiljs-lazy";

const someArbitrarilyLargeComponent = lazy(() => import("./split_component"));

export const app = (): WNode<Node> => {
    return div({className: "wrapper-div"},
      suspense({fallback: div("loading....")},
        someArbitrarilyLargeComponent(),
      ),
    )
};
