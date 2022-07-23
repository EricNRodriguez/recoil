import {Runnable} from "../../util";
import {UpdateScheduler} from "./atom";

enum StateKind {
  BATCH = "batch",
  EAGER = "eager",
}

interface LazyBatchUpdateState {
  kind: StateKind.BATCH;
  scheduledUpdates: Runnable[];
}

interface EagerUpdateState {
  kind: StateKind.EAGER;
}

type UpdateSchedulerState = LazyBatchUpdateState | EagerUpdateState;

/**
 * An update scheduler that supports deferred updates.
 */
export class BatchUpdateScheduler implements UpdateScheduler{
  private state: UpdateSchedulerState = {kind: StateKind.EAGER};

  public schedule(update: Runnable): void {
    switch (this.state.kind) {
      case StateKind.BATCH:
        this.scheduleBatchedUpdate(update);
        return;
      case StateKind.EAGER:
        this.scheduleEagerUpdate(update);
        return;
      default:
        throw new Error(`fallthrough - BatchUpdateScheduler in invalid state state`);
    }
  }

  public enterBatchState(): void {
    if (this.state.kind === StateKind.BATCH) {
      return;
    }

    this.state = {
      kind: StateKind.BATCH,
      scheduledUpdates: [],
    }
  }

  public exitBatchedState(): void {
      if (this.state.kind !== StateKind.BATCH) {
        return;
      }

      this.state.scheduledUpdates.forEach(update => update());
      this.state = {kind: StateKind.EAGER};
  }

  private scheduleBatchedUpdate(update: Runnable): void {
    (this.state as LazyBatchUpdateState).scheduledUpdates.push(update);
  }

  private scheduleEagerUpdate(update: Runnable): void {
    update();
  }
}