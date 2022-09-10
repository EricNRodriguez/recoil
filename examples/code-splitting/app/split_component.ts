import {WElement} from "recoiljs-dom";
import {withContext, onMount} from "recoiljs-context";
import {div} from "recoiljs-dom-dsl";

export default withContext((): WElement<HTMLElement> => {
    onMount((): void => {
        console.log("someArbitrarilyLargeComponent mounted!");
    });

    return div("someArbitrarilyLargeComponent that was lazily loaded!");
});