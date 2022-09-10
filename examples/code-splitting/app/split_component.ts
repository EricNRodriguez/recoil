import {WElement} from "recoiljs-dom";
import {withContext, onMount} from "../../../packages/component";
import {div} from "recoiljs-dom-dsl";

export default withContext((): WElement<HTMLElement> => {
    onMount((): void => {
        console.log("someArbitrarilyLargeComponent mounted!");
    });

    return div("someArbitrarilyLargeComponent that was lazily loaded!");
});