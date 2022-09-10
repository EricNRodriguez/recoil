import {WElement} from "recoiljs-dom";
import {createComponent, onMount} from "recoiljs-component";
import {div} from "recoiljs-dom-dsl";

export default createComponent((): WElement<HTMLElement> => {
    onMount((): void => {
        console.log("someArbitrarilyLargeComponent mounted!");
    });

    return div("someArbitrarilyLargeComponent that was lazily loaded!");
});