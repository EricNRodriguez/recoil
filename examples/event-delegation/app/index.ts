import {createElement, registerEventHandler} from "recoiljs-dom";
import { createComponent } from "recoiljs-component";
import { runApp, div } from "recoiljs-dom-dsl";

customElements.define(
  "user-card",
  class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot!.innerHTML = `<p id="pid"> <button>Click me</button> </p>`;
      (this.shadowRoot as any).firstElementChild.onclick = (e: any) => {
        alert("Inner target: " + e.target.tagName);
      };
    }
  }
);

const app = createComponent(() => {
  const userCard = createElement("user-card" as any, {
    onclick: (e: any) => alert("NON-DELEGATED HANDLER: user-card element seeing target as " + e.target.tagName)
  }, []);
  registerEventHandler(userCard, "click", (e: any) => {
    alert(
      "DELEGATED HANDLER: user-card element seeing target as " +
      e.target.tagName
    );
  });

  const wrapper = div({onclick: (e: any) => alert("NON-DELEGATED HANDLER: outer non-shadow div seeing target as " + e.target.tagName)},
       userCard,
  );
  registerEventHandler(wrapper, "click", (e: any) =>
    alert(
      "DELEGATED HANDLER: outer non-shadow div seeing target as " +
      e.target.tagName
    )
  );

  return wrapper;
});

runApp(document.body, app());
