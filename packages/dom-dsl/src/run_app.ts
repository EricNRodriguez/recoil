import { WElement, WNode } from "../../dom";

export const runApp = (anchor: HTMLElement, app: WNode<Node>): void => {
  // NOTE(ericr): This has some large implications, one of which is that now the VElement tree
  // is never GCd, even when the elements are static. This is fine for now since its lightweight, but it
  // may be something to look into optimizing
  (anchor as any).$$$recoilVElementWrapper = new WElement(anchor)
    .setChildren(app)
    .mount();
};
