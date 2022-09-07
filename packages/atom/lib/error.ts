export class StatefulSideEffectError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "StatefulSideEffectError";
    this.stack = (<any>new Error()).stack;
  }
}
