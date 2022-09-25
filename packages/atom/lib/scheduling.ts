import { Runnable } from "shared";
import { IEffectScheduler, IUpdateExecutor } from "./atom";
import {MinQueue} from "heapify";

enum StateKind {
  BATCH = "batch",
  EAGER = "eager",
}

interface LazyBatchUpdateState {
  kind: StateKind.BATCH;
  // records the depth of batch calls to enable nesting
  depth: number;

  nUpdates: number;
  updates: Map<number, Runnable>;
  scheduler: MinQueue;
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

  public schedule(effect: Runnable, priority: number): void {
    switch (this.state.kind) {
      case StateKind.BATCH:
        this.scheduleBatchedUpdate(effect, priority);
        return;
      case StateKind.EAGER:
        this.scheduleEagerUpdate(effect);
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
      nUpdates: 0,
      updates: new Map(),
      scheduler: new MinQueue(),
    };
  }

  public exitBatchedState(): void {
    if (this.state.kind !== StateKind.BATCH) {
      return;
    }

    this.state.depth--;
    if (this.state.depth !== 0) {
      return;
    }

    // TODO(ericr): look further into why this is required
    while (this.state.scheduler !== undefined && this.state.scheduler.size > 0) {
      const key = this.state.scheduler.pop();
      if (key === undefined) {
        throw Error("undefined key returned for nonempty min heap");
      }

      if (!this.state.updates.has(key)) {
        throw Error("unknown key returned from effect scheduler");
      }

      this.state.updates.get(key)!();
    }

    this.state = { kind: StateKind.EAGER };
  }

  private scheduleBatchedUpdate(effect: Runnable, priority: number): void {
    if (this.state.kind !== StateKind.BATCH) {
      throw new Error("batchupdater in invalid state - scheduleBatchedUpdate outside of batch state");
    }

    this.state.nUpdates = this.state.nUpdates + 1;
    this.state.updates.set(this.state.nUpdates, effect);
    this.state.scheduler.push(this.state.nUpdates, priority);
  }

  private scheduleEagerUpdate(effect: Runnable): void {
    effect();
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
