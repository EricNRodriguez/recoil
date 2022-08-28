"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchingEffectScheduler = void 0;
var StateKind;
(function (StateKind) {
    StateKind["BATCH"] = "batch";
    StateKind["EAGER"] = "eager";
})(StateKind || (StateKind = {}));
/**
 * An update scheduler that supports deferred updates.
 */
class BatchingEffectScheduler {
    constructor() {
        this.state = { kind: StateKind.EAGER };
    }
    schedule(update) {
        switch (this.state.kind) {
            case StateKind.BATCH:
                this.scheduleBatchedUpdate(update);
                return;
            case StateKind.EAGER:
                this.scheduleEagerUpdate(update);
                return;
            default:
                throw new Error(`fallthrough - BatchingEffectScheduler in invalid state state`);
        }
    }
    enterBatchState() {
        if (this.state.kind === StateKind.BATCH) {
            return;
        }
        this.state = {
            kind: StateKind.BATCH,
            scheduledUpdates: new Set(),
        };
    }
    exitBatchedState() {
        if (this.state.kind !== StateKind.BATCH) {
            return;
        }
        this.state.scheduledUpdates.forEach((update) => update());
        this.state = { kind: StateKind.EAGER };
    }
    scheduleBatchedUpdate(update) {
        this.state.scheduledUpdates.add(update);
    }
    scheduleEagerUpdate(update) {
        update();
    }
}
exports.BatchingEffectScheduler = BatchingEffectScheduler;
