import { Runnable } from "../../util";
import { IEffectScheduler } from "./atom";

enum StateKind {
  BATCH = "batch",
  EAGER = "eager",
}

interface LazyBatchUpdateState {
  kind: StateKind.BATCH;
  scheduledUpdates: Set<Runnable>;
}

interface EagerUpdateState {
  kind: StateKind.EAGER;
}

type EffectSchedulerState = LazyBatchUpdateState | EagerUpdateState;

/**
 * An update scheduler that supports deferred updates.
 */
export class BatchingEffectScheduler implements IEffectScheduler {
  private state: EffectSchedulerState = { kind: StateKind.EAGER };

  public schedule(update: Runnable): void {
    switch (this.state.kind) {
      case StateKind.BATCH:
        this.scheduleBatchedUpdate(update);
        return;
      case StateKind.EAGER:
        this.scheduleEagerUpdate(update);
        return;
      default:
        throw new Error(
          `fallthrough - BatchingEffectScheduler in invalid state state`
        );
    }
  }

  public enterBatchState(): void {
    if (this.state.kind === StateKind.BATCH) {
      return;
    }

    this.state = {
      kind: StateKind.BATCH,
      scheduledUpdates: new Set(),
    };
  }

  public exitBatchedState(): void {
    if (this.state.kind !== StateKind.BATCH) {
      return;
    }

    this.state.scheduledUpdates.forEach((update) => update());
    this.state = { kind: StateKind.EAGER };
  }

  private scheduleBatchedUpdate(update: Runnable): void {
    (this.state as LazyBatchUpdateState).scheduledUpdates.add(update);
  }

  private scheduleEagerUpdate(update: Runnable): void {
    update();
  }
}
