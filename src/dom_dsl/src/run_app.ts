import {HtmlVElement} from "./vdom/virtual_element";

export const runApp = (anchor: HTMLElement, app: HtmlVElement): void => {
    (anchor as any).$$$recoilVElementWrapper = new HtmlVElement(anchor)
        .setChildren(app)
        .mount();
};