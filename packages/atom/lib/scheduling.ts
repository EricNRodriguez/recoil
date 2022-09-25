import { Runnable } from "shared";
import { IEffectScheduler, IUpdateExecutor } from "./atom";

enum StateKind {
  BATCH = "batch",
  EAGER = "eager",
}

interface LazyBatchUpdateState {
  kind: StateKind.BATCH;
  // records the depth of batch calls to enable nesting
  depth: number;
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

  public executeAsBatch(job: Runnable): void {
    try {
      this.enterBatchState();
      job();
    } finally {
      this.exitBatchedState();
    }
  }

  public enterBatchState(): void {
    if (this.state.kind === StateKind.BATCH) {
      this.state.depth++;
      return;
    }

    this.state = {
      kind: StateKind.BATCH,
      depth: 1,
      scheduledUpdates: new Set(),
    };
  }

  public exitBatchedState(): void {
    if (this.state.kind !== StateKind.BATCH) {
      return;
    }

    this.state.depth--;

    if (this.state.depth === 0) {
      this.state.scheduledUpdates.forEach((update) => update());
      this.state = { kind: StateKind.EAGER };
    }
  }

  private scheduleBatchedUpdate(update: Runnable): void {
    (this.state as LazyBatchUpdateState).scheduledUpdates.add(update);
  }

  private scheduleEagerUpdate(update: Runnable): void {
    update();
  }
}

export class UpdateExecutor implements IUpdateExecutor {
  private readonly batchingEffectScheduler: BatchingEffectScheduler;

  public constructor(batchingEffectScheduler: BatchingEffectScheduler) {
    this.batchingEffectScheduler = batchingEffectScheduler;
  }

  public executeAtomicUpdate(job: Runnable): void {
    this.batchingEffectScheduler.executeAsBatch(job);
  }
}
