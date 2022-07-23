import { VNode } from "../../vdom";
import { Consumer, Producer } from "../../util";
import { deriveState, IAtom } from "../../atom";

/**
 * A plain old javascript function that returns a VNode (or subclass of it)
 */
export type DomBuilder<T extends VNode<Node>> = (...args: any[]) => T;

/**
 * A utility 'factory' that manages the scope of currently 'building' components.
 *
 * It allows you to defer consumer functions that run against the root vnode of the component that is currently
 * under construction before it is created, which opens up many opportunities for declarative hooks.
 */
export class ComponentFactory {
  private static readonly instance = new ComponentFactory();
  private readonly consumeVNodeQueue: Map<
    number,
    Consumer<IAtom<VNode<Node>>>[]
  > = new Map();

  private currentScope: number = -1;

  public static getInstance(): ComponentFactory {
    return ComponentFactory.instance;
  }

  public isInScope(): boolean {
    return this.currentScope >= 0;
  }

  public getCurrentComponentVNodeConsumers(): Consumer<IAtom<VNode<Node>>>[] {
    return this.consumeVNodeQueue.get(this.currentScope) ?? [];
  }

  private enterScope(): void {
    this.currentScope++;

    this.consumeVNodeQueue.set(this.currentScope, []);
  }

  private exitScope(): void {
    this.consumeVNodeQueue.delete(this.currentScope);

    this.currentScope--;
  }

  public registerNextComponentConsumer(
    consumer: Consumer<IAtom<VNode<Node>>>
  ): void {
    if (!this.isInScope()) {
      // TODO(ericr): more specific error message and type
      throw new Error(
        "unable to register consumer outside of a component context"
      );
    }

    this.consumeVNodeQueue.get(this.currentScope)?.push(consumer);
  }

  /**
   * Executes a dom builder inside a managed scope/context, allowing functions that run against
   * the return value to be queued.
   *
   * @param fn A simple dom constructor
   */
  public buildComponent<T extends VNode<Node>>(fn: Producer<T>): T {
    try {
      this.enterScope();

      // Building the component inside of a tracked context allows us to react whenever any
      // tracked state that was used to construct the component is dirtied, which opens up
      // some powerful lifecycle methods such as onUpdate, without any implicit code to track
      // and propagate such events
      const buildComponent: IAtom<T> = deriveState(fn);
      const component = buildComponent.get();

      if (this.getCurrentComponentVNodeConsumers().length > 0) {
        (component as any).$$$recoilBuildComponentTrackedScope = buildComponent;
      }

      this.getCurrentComponentVNodeConsumers().forEach(
        (consumer: Consumer<IAtom<VNode<Node>>>): void =>
          consumer(buildComponent)
      );

      return component;
    } finally {
      this.exitScope();
    }
  }
}

/**
 * A higher order function that creates components. A component is any stateful Dom builder, i.e. any function
 * that constructs a DOM tree that contains ANY stateful logic.
 *
 * This function provides some 'magic' that automatically binds the lifecycle of any side effects created within
 * the injected builder to the lifecycle of the constructed Dom node. I.e. when it is mounted, they are activated,
 * when it is unmounted, they are deactivated. This is critical for performance, as it ensures that the only eager
 * updates being made to the DOM are visible by the user. A result of this is that side effects are automatically
 * kept alive for the lifetime of the DOM tree, which means the references returned by the runEffect factory method
 * can be safely ignored.
 *
 * @param fn The VNode builder to be wrapped.
 * @returns The wrapped function
 */
export const createComponent = <T extends VNode<Node>>(fn: DomBuilder<T>) => {
  return (...args: any[]): T => {
    return ComponentFactory.getInstance().buildComponent(() => fn(...args));
  };
};
