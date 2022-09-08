import { createElement, WNode } from "recoiljs-dom";

export const runApp = (anchor: HTMLElement, app: WNode<Node>): void => {
  (anchor as any).$$$recoilVElementWrapper = createElement(anchor, {}, [
    app,
  ]).mount();
};
