import {unwrapVNode} from "./vdom/vdom_util";
import {replaceChildren} from "./util/dom_utils";
import {HtmlVElement} from "./vdom/virtual_element";

export const runApp = (anchor: Element, app: HtmlVElement): void => {
    replaceChildren(
        anchor,
        unwrapVNode(app)
    );
    app.mount();
};