import { WNode, wrapElement } from "recoiljs-dom";

export const runApp = (anchor: HTMLElement, app: WNode<Node>): void => {
  (anchor as any).$$$recoilVElementWrapper = wrapElement(anchor)
    .setChildren([app])
    .mount();
};
