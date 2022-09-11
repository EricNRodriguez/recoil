import { WNode, wrapElement } from "recoiljs-dom";

export const runApp = (anchor: HTMLElement, app: WNode<Node>): void => {
  wrapElement(anchor).setChildren([app]);
};
