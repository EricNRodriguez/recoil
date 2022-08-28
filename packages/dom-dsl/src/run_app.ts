import { createElement, WNode } from "dom";

export const runApp = (anchor: HTMLElement, app: WNode<Node>): void => {
  (anchor as any).$$$recoilVElementWrapper = createElement(anchor, {}, [
    app,
  ]).mount();
};
