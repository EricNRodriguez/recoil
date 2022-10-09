import { createComponent, onMount } from "recoiljs-component";
import { div } from "recoiljs-dom-dsl";

export default createComponent(() => {
  onMount((): void => {
    console.log("someArbitrarilyLargeComponent mounted!");
  });

  return div("someArbitrarilyLargeComponent that was lazily loaded!");
});
