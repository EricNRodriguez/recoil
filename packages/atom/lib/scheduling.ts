import {Producer, Runnable} from "shared";
import { IEffectScheduler, IUpdateExecutor } from "./atom";

enum StateKind {
  BATCH = "batch",
  EAGER = "eager",
}

export enum EffectPriority {
  MAJOR=0,
  HIGH=1,
  MEDIUM=2,
  LOW=3,
  MINOR=4,
}

interface LazyBatchUpdateState {
  kind: StateKind.BATCH;
  // records the depth of batch calls to enable nesting
  depth: number;
  nUpdates: number;
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

  /*
    The following fields have been pulled out of the batch state object to avoid recreation, making state transitions cheap.
   */
  private readonly queue: Map<number, Runnable[]> = new Map(
    Object.values(EffectPriority)
      .filter((pri) => Number.isInteger(pri))
      .map((pri) => [pri as number, []])
  );

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

  public executeAsBatch<ReturnType>(job: Producer<ReturnType>): ReturnType {
    try {
      this.enterBatchState();
      return job();
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

    const priorities: number[] = Object.values(EffectPriority)
      .filter((v) => Number.isInteger(v)) as number[];

    const effects: Runnable[] = [];
    for (let pri of priorities) {
      effects.push(
        ...this.queue.get(pri)!
      );
      this.queue.get(pri)!.length = 0;
    }

    this.state = { kind: StateKind.EAGER };

    effects.forEach((e) => e());
  }

  private scheduleBatchedUpdate(effect: Runnable, priority: EffectPriority): void {
    if (this.state.kind !== StateKind.BATCH) {
      throw new Error("batchupdater in invalid state - scheduleBatchedUpdate outside of batch state");
    }

    this.state.nUpdates = this.state.nUpdates + 1;
    this.queue.get(priority)?.push(effect);
  }

  private scheduleEagerUpdate(effect: Runnable): void {
    effect();
  }
}

export class BatchingUpdateExecutor implements IUpdateExecutor {
  private readonly batchingEffectScheduler: BatchingEffectScheduler;

  public constructor(batchingEffectScheduler: BatchingEffectScheduler) {
    this.batchingEffectScheduler = batchingEffectScheduler;
  }

  public executeAtomicUpdate(job: Runnable): void {
    this.batchingEffectScheduler.executeAsBatch(job);
  }
}
