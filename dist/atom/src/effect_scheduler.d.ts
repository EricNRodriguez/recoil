import { Runnable } from "../../utils";
import { IEffectScheduler } from "./atom";
/**
 * An update scheduler that supports deferred updates.
 */
export declare class BatchingEffectScheduler implements IEffectScheduler {
    private state;
    schedule(update: Runnable): void;
    enterBatchState(): void;
    exitBatchedState(): void;
    private scheduleBatchedUpdate;
    private scheduleEagerUpdate;
}
//# sourceMappingURL=effect_scheduler.d.ts.map