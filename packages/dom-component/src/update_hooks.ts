import {IAtom} from "../../atom";
import {Runnable} from "../../util";
import {VNode} from "../../vdom";
import {ComponentFactory} from "./component_factory";

export const onSubtreeUpdate = (sideEffect: Runnable): void => {
  ComponentFactory.getInstance().registerNextComponentConsumer((component: IAtom<VNode<Node>>): void => {
    component.react(sideEffect);
  });
};
