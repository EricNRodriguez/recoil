import { WNode, wrapElement } from "recoiljs-dom";

const mountedApps: WNode<Node>[] = [];
export const runApp = (anchor: HTMLElement, app: WNode<Node>): void => {
  wrapElement(anchor).setChildren([app]);
  // prevent gc
  mountedApps.push(app);
};
