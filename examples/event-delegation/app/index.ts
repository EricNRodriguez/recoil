import {createElement, WNode } from "recoiljs-dom";
import { createComponent } from "recoiljs-component";
import {runApp, div} from "recoiljs-dom-dsl"

customElements.define('user-card', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot!.innerHTML = `<p> <button>Click me</button> </p>`;
        (this.shadowRoot as any).firstElementChild.onclick = (e: any) => {
            alert("Inner target: " + e.target.tagName);
        }
    }
});

const app = createComponent((): WNode<Node> => {
    return div(
      createElement("user-card" as any, {}, [])
        .setEventHandler("click", (e: any) => {
            alert("DELEGATED HANDLER: user-card element seeing target as " + (e.target.tagName));
        })
        .setEventHandler("click", (e: any) => {
            alert("NON-DELEGATED HANDLER: user-card element seeing target as " + (e.target.tagName));
        }, false),
    ).setEventHandler("click", (e: any) => alert("DELEGATED HANDLER: outer non-shadow div seeing target as " + (e.target.tagName)))
      .setEventHandler("click", (e: any) => alert("NON-DELEGATED HANDLER: outer non-shadow div seeing target as " + e.target.tagName), false);

});

runApp(
  document.body,
  app(),
);